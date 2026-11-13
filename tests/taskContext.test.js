import test, { after } from "node:test"
import assert from "node:assert/strict"
import { act } from "react"
import { criarAmbientePaginas } from "./helpers/reactPage.js"

const ambiente = await criarAmbientePaginas()
after(() => ambiente.fechar())

test("mede renderizações e mudanças nas identidades das ações após cinco atualizações", async () => {
  const app = await ambiente.montarProvider()
  try {
    const inicial = app.contagens.acoes
    const acoes = Object.fromEntries(Object.entries(app.acoes).filter(([, valor]) => typeof valor === "function"))
    let trocas = 0
    for (let index = 0; index < 5; index += 1) {
      await act(async () => app.dados.criarTarefa({ titulo: `Tarefa ${index}` }))
      for (const [nome, funcao] of Object.entries(acoes)) if (app.acoes[nome] !== funcao) trocas += 1
    }
    console.log(`Context: renderizações adicionais de consumidor de ações = ${app.contagens.acoes - inicial}; identidades trocadas = ${trocas}`)
    assert.equal(app.dados.tarefas.length, 5)
    assert.equal(app.contagens.acoes - inicial, 0)
    assert.equal(trocas, 0)
  } finally {
    await app.desmontar()
  }
})

test("mede propagação de três renderizações do pai sem alteração de dados", async () => {
  const app = await ambiente.montarProvider()
  try {
    const antes = { ...app.contagens }
    for (let index = 0; index < 3; index += 1) await app.renderizar()
    assert.deepEqual(app.contagens, antes)
    console.log(`Context: renderizações por atualização do pai: dados=${app.contagens.dados - antes.dados}; ações=${app.contagens.acoes - antes.acoes}`)
  } finally {
    await app.desmontar()
  }
})

test("ações capturadas antes das renderizações consultam o estado mais recente", async () => {
  const app = await ambiente.montarProvider()
  try {
    const acoes = app.acoes
    const inicial = app.dados
    let tarefaId
    let topicoId
    await act(async () => {
      tarefaId = acoes.criarTarefa({ titulo: "Primeira" }).id
      topicoId = acoes.criarTopico({ nome: "Trabalho" }).id
    })
    await act(async () => {
      acoes.criarTarefa({ titulo: "Segunda" })
      acoes.moverTarefa(tarefaId, topicoId)
      acoes.alternarConclusao(tarefaId)
      assert.equal(acoes.criarTopico({ nome: " trabalho " }).erro, "Já existe um tópico com esse nome.")
    })
    assert.equal(app.acoes, acoes)
    assert.notEqual(app.dados, inicial)
    assert.equal(app.dados.tarefas.length, 2)
    assert.equal(app.dados.tarefas[0].topicoId, topicoId)
    assert.equal(app.dados.tarefas[0].concluida, true)
    await act(async () => acoes.excluirTopico(topicoId))
    assert.equal(app.dados.tarefas[0].topicoId, "")
    assert.deepEqual(app.dados.topicos, [])
    assert.equal(app.acoes, acoes)
  } finally {
    await app.desmontar()
  }
})

test("falha e recuperação da persistência atualizam o aviso sem trocar ações", async (t) => {
  const app = await ambiente.montarProvider()
  try {
    const acoes = app.acoes
    const prototipo = Object.getPrototypeOf(localStorage)
    const gravar = prototipo.setItem
    let falhar = true
    t.mock.method(prototipo, "setItem", function (...args) {
      if (falhar) throw new Error("Quota")
      return gravar.apply(this, args)
    })
    await act(async () => assert.equal(acoes.criarTarefa({ titulo: "Não salva" }).salvo, false))
    assert.ok(app.dados.erroArmazenamento)
    assert.deepEqual(app.mensagens, [])
    assert.equal(app.acoes, acoes)
    falhar = false
    await act(async () => assert.equal(acoes.criarTopico({ nome: "Recuperado" }).salvo, true))
    assert.equal(app.dados.erroArmazenamento, "")
    assert.equal(app.acoes, acoes)
    assert.equal(app.contagens.acoes, 1)
    const salvo = JSON.parse(localStorage.getItem("task-manager:dados"))
    assert.deepEqual(salvo.tarefas, app.dados.tarefas)
    assert.deepEqual(salvo.topicos, app.dados.topicos)
  } finally {
    await app.desmontar()
  }
})

test("mudança legítima da função de notificação atualiza as ações sem capturar callback antigo", async () => {
  const app = await ambiente.montarProvider()
  try {
    const antigas = app.acoes
    const mensagens = []
    await app.renderizar((mensagem) => mensagens.push(mensagem))
    assert.notEqual(app.acoes, antigas)
    await act(async () => app.acoes.criarTarefa({ titulo: "Teste" }))
    assert.deepEqual(mensagens, ["Tarefa cadastrada com sucesso."])
    assert.deepEqual(app.mensagens, [])
  } finally {
    await app.desmontar()
  }
})

test("nenhuma mudança de coleções mantém o objeto combinado e os consumidores estáveis", async () => {
  const app = await ambiente.montarProvider()
  try {
    const dados = app.dados
    const contagens = { ...app.contagens }
    await act(async () => app.acoes.setTarefas((atuais) => atuais))
    assert.equal(app.dados, dados)
    assert.deepEqual(app.contagens, contagens)
  } finally {
    await app.desmontar()
  }
})
