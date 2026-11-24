import assert from "node:assert/strict"
import { randomUUID } from "node:crypto"
import { once } from "node:events"
import { readFile } from "node:fs/promises"
import process from "node:process"
import test from "node:test"
import pg from "pg"
import { criarApp } from "./app.js"
import { criarPool } from "./db.js"

async function abrirApi(t, pool) {
  const servidor = criarApp(pool).listen(0, "127.0.0.1")
  await once(servidor, "listening")
  t.after(() => new Promise((resolve, reject) => {
    servidor.close((erro) => erro ? reject(erro) : resolve())
  }))
  const base = `http://127.0.0.1:${servidor.address().port}/api`

  return async (rota, method = "GET", corpo, tipo = "application/json") => {
    const opcoes = corpo === undefined ? { method } : {
      method,
      headers: { "Content-Type": tipo },
      body: typeof corpo === "string" ? corpo : JSON.stringify(corpo),
    }
    const resposta = await fetch(base + rota, opcoes)
    return { status: resposta.status, dados: resposta.status === 204 ? null : await resposta.json() }
  }
}

test("saúde responde mesmo sem banco configurado", async (t) => {
  const api = await abrirApi(t)
  assert.deepEqual(await api("/health"), { status: 200, dados: { status: "ok" } })
  for (const rota of ["/tarefas", "/topicos"]) {
    assert.deepEqual(await api(rota), {
      status: 503, dados: { erro: "Configure DATABASE_URL no servidor para acessar os registros." },
    })
  }
  assert.equal((await api("/registros/limpeza", "POST", { tarefasIds: [], topicosIds: [] })).status, 503)
  assert.deepEqual(await api("/inexistente"), { status: 404, dados: { erro: "Rota não encontrada." } })
})

test("API responde em JSON a falhas de leitura, tipo e tamanho do corpo", async (t) => {
  const api = await abrirApi(t)
  assert.deepEqual(await api("/tarefas", "POST", "{"), { status: 400, dados: { erro: "JSON inválido." } })
  assert.deepEqual(await api("/tarefas", "POST", { titulo: "x".repeat(110_000) }), {
    status: 413, dados: { erro: "Corpo da requisição muito grande." },
  })
  assert.deepEqual(await api("/tarefas", "POST", { titulo: "Teste" }, "application/json; charset=iso-8859-1"), {
    status: 415, dados: { erro: "Formato da requisição não aceito." },
  })
})

test("falha inesperada do banco retorna erro genérico e preserva a rota de saúde", async (t) => {
  const falha = Object.assign(new Error("Detalhe interno da conexão"), { code: "ECONNREFUSED" })
  t.mock.method(console, "error", () => {})
  const api = await abrirApi(t, { query: async () => { throw falha } })
  assert.deepEqual(await api("/tarefas"), { status: 500, dados: { erro: "Não foi possível processar a requisição." } })
  assert.deepEqual(await api("/health"), { status: 200, dados: { status: "ok" } })
})

test("CRUD de tarefas e tópicos com PostgreSQL", async (t) => {
  const admin = criarPool()
  const schema = "teste_" + randomUUID().replaceAll("-", "")
  let schemaCriado = false
  t.after(async () => {
    try {
      if (schemaCriado) await admin.query(`DROP SCHEMA ${schema} CASCADE`)
    } finally {
      await admin.end()
    }
  })
  await admin.query(`CREATE SCHEMA ${schema}`)
  schemaCriado = true
  const url = new URL(process.env.DATABASE_URL)
  url.searchParams.set("options", `-c search_path=${schema}`)
  const pool = new pg.Pool({ connectionString: url.href })
  t.after(() => pool.end())
  const { rows: [sessao] } = await pool.query("SELECT current_schema() AS schema")
  assert.equal(sessao.schema, schema)
  await pool.query(await readFile(new URL("./migrations/001_initial.sql", import.meta.url), "utf8"))

  const api = await abrirApi(t, pool)
  assert.deepEqual(await api("/tarefas"), { status: 200, dados: [] })
  assert.deepEqual(await api("/topicos"), { status: 200, dados: [] })

  assert.deepEqual(await api("/tarefas/%FF"), { status: 400, dados: { erro: "Identificador inválido." } })
  assert.deepEqual(await api("/topicos/id%20invalido"), { status: 400, dados: { erro: "Identificador inválido." } })
  await pool.query("INSERT INTO tarefas (id, titulo, posicao) VALUES ($1, $2, $3)", ["rotina-café", "Legada", 0])
  const legada = "/tarefas/" + encodeURIComponent("rotina-café")
  assert.equal((await api(legada)).dados.titulo, "Legada")
  assert.equal((await api(legada, "PATCH", { concluida: true })).dados.concluida, true)
  assert.equal((await api(legada, "DELETE")).status, 204)

  const criacao = await api("/tarefas", "POST", { titulo: "  Primeira  ", data: "2028-02-29" })
  assert.equal(criacao.status, 201)
  const primeira = criacao.dados
  assert.deepEqual(primeira, {
    id: primeira.id, titulo: "Primeira", descricao: "", data: "2028-02-29",
    cor: "#ef4444", concluida: false, topicoId: "",
  })
  const tarefa = "/tarefas/" + primeira.id
  assert.equal((await api(tarefa, "PATCH", { concluida: true })).dados.concluida, true)
  assert.equal((await api(tarefa, "PATCH", { titulo: "Revisada", data: "" })).dados.data, "")
  assert.equal((await api(tarefa)).dados.concluida, true)
  const segunda = (await api("/tarefas", "POST", { titulo: "Segunda" })).dados
  assert.deepEqual((await api("/tarefas")).dados.map(({ id }) => id), [primeira.id, segunda.id])

  const respostas = await Promise.all([
    api("/topicos", "POST", { nome: "Casa", cor: "green", agruparSemTopico: true }),
    api("/topicos", "POST", { nome: " casa ", cor: "green", agruparSemTopico: true }),
  ])
  assert.deepEqual(respostas.map(({ status }) => status).sort(), [201, 409])
  const topico = respostas.find(({ status }) => status === 201).dados
  const rotaTopico = "/topicos/" + topico.id
  assert.deepEqual((await api(rotaTopico)).dados, topico)
  assert.equal((await api(tarefa)).dados.topicoId, topico.id)
  assert.equal((await api(rotaTopico, "PATCH", { nome: "CASA", cor: "orange" })).dados.cor, "orange")
  const trabalho = (await api("/topicos", "POST", { nome: "Trabalho" })).dados
  assert.equal(trabalho.cor, "blue")
  assert.deepEqual((await api("/topicos")).dados.map(({ id }) => id), [topico.id, trabalho.id])
  assert.equal((await api(rotaTopico, "PATCH", { nome: "trabalho" })).status, 409)

  assert.equal((await api(tarefa, "PATCH", { topicoId: "" })).dados.topicoId, "")
  assert.equal((await api(tarefa, "PATCH", { topicoId: topico.id })).dados.topicoId, topico.id)
  assert.equal((await api(rotaTopico, "DELETE")).status, 204)
  assert.equal((await api(rotaTopico)).status, 404)
  assert.equal((await api(tarefa)).dados.topicoId, "")
  assert.equal((await api(tarefa, "DELETE")).status, 204)
  assert.equal((await api(tarefa)).status, 404)
  assert.equal((await api("/tarefas")).dados.length, 1)

  for (const [rota, corpo] of [
    ["/tarefas", { titulo: " " }],
    ["/tarefas", { titulo: "Inválida", data: "2026-02-29" }],
    ["/tarefas", { titulo: "Inválida", concluida: "false" }],
    ["/tarefas", { titulo: "Inválida", topicoId: "ausente" }],
    ["/tarefas", "{"],
    ["/topicos", { nome: "Inválido", cor: "desconhecida" }],
  ]) {
    const resposta = await api(rota, "POST", corpo)
    assert.equal(resposta.status, 400)
    assert.ok(resposta.dados.erro)
  }

  const pessoal = (await api("/topicos", "POST", { nome: "Pessoal" })).dados
  const terceira = (await api("/tarefas", "POST", { titulo: "Terceira", topicoId: trabalho.id })).dados
  const quarta = (await api("/tarefas", "POST", { titulo: "Quarta" })).dados
  const antes = [segunda.id, terceira.id, quarta.id]
  const ordem = [quarta.id, terceira.id, segunda.id]
  const rotaOrdem = "/tarefas/ordem/manual"
  assert.equal((await api(rotaOrdem, "PATCH", { antes, ordem: [segunda.id, segunda.id] })).status, 400)
  assert.equal((await api(rotaOrdem, "PATCH", { antes, ordem: [terceira.id, segunda.id, quarta.id] })).status, 409)
  assert.equal((await api(rotaOrdem, "PATCH", { antes, ordem })).status, 204)
  assert.equal((await api(rotaOrdem, "PATCH", { antes, ordem })).status, 409)
  assert.deepEqual((await api("/tarefas")).dados.map(({ id }) => id), ordem)
  assert.equal((await api("/topicos/ordem/manual", "PATCH", {
    antes: [trabalho.id, pessoal.id], ordem: [pessoal.id, trabalho.id],
  })).status, 204)
  assert.deepEqual((await api("/topicos")).dados.map(({ id }) => id), [pessoal.id, trabalho.id])

  const limpeza = "/registros/limpeza"
  const topicosIds = [pessoal.id, trabalho.id]
  await pool.query("INSERT INTO consumo_agua (dia, quantidades) VALUES ('2026-11-23', ARRAY[200])")
  await assert.rejects(pool.query("UPDATE consumo_agua SET quantidades = ARRAY[0]"), { code: "23514" })
  assert.equal((await api(limpeza, "POST", { tarefasIds: ordem })).status, 400)
  assert.equal((await api(limpeza, "POST", { tarefasIds: [], topicosIds })).status, 409)
  assert.equal((await api("/tarefas")).dados.length, 3)
  assert.equal((await api("/topicos")).dados.length, 2)
  assert.equal((await api(limpeza, "POST", { tarefasIds: ordem, topicosIds })).status, 204)
  assert.deepEqual((await api("/tarefas")).dados, [])
  assert.deepEqual((await api("/topicos")).dados, [])
  assert.deepEqual((await pool.query("SELECT quantidades FROM consumo_agua")).rows, [{ quantidades: [200] }])
})
