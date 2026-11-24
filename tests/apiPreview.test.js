import assert from "node:assert/strict"
import test from "node:test"
import { act } from "react"
import { botao, clicar, criarAmbientePaginas, enviar, preencher } from "./helpers/reactPage.js"

test("prévia carrega em paralelo, informa falha e tenta novamente sem gravar no navegador", async (t) => {
  const requisicoes = []
  t.mock.method(globalThis, "fetch", (rota, opcoes) => new Promise((resolve) => {
    requisicoes.push({ rota, opcoes, resolve })
  }))

  const ambiente = await criarAmbientePaginas()
  try {
    const componente = await ambiente.montar("/src/components/tasks/ApiPreview.jsx", {})
    try {
      const local = '{"versao":1,"tarefas":[],"topicos":[]}'
      localStorage.setItem("task-manager:dados", local)
      assert.match(document.querySelector('[role="status"]').textContent, /Carregando/)
      assert.deepEqual(requisicoes.map(({ rota }) => rota), ["/api/tarefas", "/api/topicos"])

      await act(async () => requisicoes[0].resolve(new Response(null, { status: 503 })))
      assert.match(document.querySelector('[role="alert"]').textContent, /PostgreSQL/)
      assert.equal(requisicoes[1].opcoes.signal.aborted, true)

      await clicar(botao("Tentar novamente"))
      assert.match(document.querySelector('[role="status"]').textContent, /Carregando/)
      await act(async () => {
        requisicoes[2].resolve(Response.json([{ id: "tarefa-remota", titulo: "Revisar proposta", concluida: false }]))
        requisicoes[3].resolve(Response.json([{ id: "topico-remoto", nome: "Trabalho" }]))
      })

      assert.match(document.querySelector("details").textContent, /Revisar proposta/)
      assert.match(document.querySelector("details").textContent, /Trabalho/)
      assert.equal(localStorage.getItem("task-manager:dados"), local)
      assert.equal(localStorage.length, 1)
    } finally {
      await componente.desmontar()
    }
  } finally {
    await ambiente.fechar()
  }
})

test("piloto mantém o rascunho após falha e confirma criação, edição e conclusão pela API", async (t) => {
  const requisicoes = []
  t.mock.method(globalThis, "fetch", (rota, opcoes) => new Promise((resolve, reject) => {
    requisicoes.push({ rota, opcoes, resolve, reject })
  }))
  const ambiente = await criarAmbientePaginas()
  try {
    const componente = await ambiente.montar("/src/components/tasks/ApiPreview.jsx", {}, { permiteGravar: true })
    try {
      await act(async () => {
        requisicoes[0].resolve(Response.json([]))
        requisicoes[1].resolve(Response.json([]))
      })
      const formulario = document.querySelector("form")
      const titulo = formulario.querySelector("input[required]")
      const escolha = formulario.querySelector("select")
      const conclusao = formulario.querySelector('input[type="checkbox"]')

      await preencher(titulo, "Rascunho")
      await enviar(formulario)
      assert.equal(formulario.querySelector("fieldset").disabled, true)
      assert.equal(requisicoes[2].opcoes.method, "POST")
      await act(async () => requisicoes[2].reject(new TypeError("falha de rede")))
      assert.match(document.querySelector('[role="alert"]').textContent, /não confirmou/)
      assert.equal(titulo.value, "Rascunho")
      assert.equal(formulario.querySelector("fieldset").disabled, false)

      const id = "62a43991-9ca0-4639-98d7-c849b67bf2a3"
      await enviar(formulario)
      await act(async () => requisicoes[3].resolve(Response.json({ id, titulo: "Rascunho", concluida: false }, { status: 201 })))
      assert.match(document.querySelector("details").textContent, /Rascunho/)
      assert.equal(titulo.value, "")
      await act(async () => {
        escolha.value = id
        escolha.dispatchEvent(new window.Event("change", { bubbles: true }))
      })
      await preencher(titulo, "Revisada")
      await clicar(conclusao)
      await clicar(botao("Salvar no servidor"))
      assert.equal(requisicoes[4].rota, "/api/tarefas/" + id)
      assert.equal(requisicoes[4].opcoes.method, "PATCH")
      assert.deepEqual(JSON.parse(requisicoes[4].opcoes.body), {
        titulo: "Revisada", concluida: true, descricao: "", data: "", topicoId: "", cor: "#ef4444",
      })
      await act(async () => requisicoes[4].resolve(Response.json({ id, titulo: "Revisada", concluida: true })))
      assert.match(document.querySelector("details").textContent, /Revisada/)
      assert.equal(localStorage.length, 0)
    } finally {
      await componente.desmontar()
    }
  } finally {
    await ambiente.fechar()
  }
})

test("piloto agrupa tarefas, edita e exclui tópicos com confirmação", async (t) => {
  const idTarefa = "62a43991-9ca0-4639-98d7-c849b67bf2a3"
  const idTopico = "62a43991-9ca0-4639-98d7-c849b67bf2a4"
  const requisicoes = []
  t.mock.method(globalThis, "fetch", (rota, opcoes) => new Promise((resolve) => {
    requisicoes.push({ rota, opcoes, resolve })
  }))
  const ambiente = await criarAmbientePaginas()
  try {
    const componente = await ambiente.montar("/src/components/tasks/ApiPreview.jsx", {}, { permiteGravar: true })
    try {
      await act(async () => {
        requisicoes[0].resolve(Response.json([{ id: idTarefa, titulo: "Revisar", concluida: false, topicoId: "" }]))
        requisicoes[1].resolve(Response.json([]))
      })
      const formulario = document.querySelector("form")
      async function selecionar(indice, valor) {
        const seletor = formulario.querySelectorAll("select")[indice]
        await act(async () => {
          seletor.value = valor
          seletor.dispatchEvent(new window.Event("change", { bubbles: true }))
        })
      }

      await clicar(botao("Tópicos"))
      await preencher(formulario.querySelector("input[required]"), "Estudo")
      await selecionar(1, "green")
      await clicar(formulario.querySelector('input[type="checkbox"]'))
      await enviar(formulario)
      assert.equal(requisicoes[2].rota, "/api/topicos")
      assert.deepEqual(JSON.parse(requisicoes[2].opcoes.body), { nome: "Estudo", cor: "green", agruparSemTopico: true })
      await act(async () => requisicoes[2].resolve(Response.json({ id: idTopico, nome: "Estudo", cor: "green" }, { status: 201 })))

      await selecionar(0, idTopico)
      await selecionar(1, "blue")
      await enviar(formulario)
      assert.equal(requisicoes[3].opcoes.method, "PATCH")
      assert.deepEqual(JSON.parse(requisicoes[3].opcoes.body), { nome: "Estudo", cor: "blue" })
      await act(async () => requisicoes[3].resolve(Response.json({ id: idTopico, nome: "Estudo", cor: "blue" })))

      await clicar(botao("Tarefas"))
      await selecionar(0, idTarefa)
      assert.equal(formulario.querySelectorAll("select")[1].value, idTopico)

      await clicar(botao("Tópicos"))
      await selecionar(0, idTopico)
      await clicar(botao("Excluir do servidor"))
      assert.equal(requisicoes.length, 4)
      await clicar(botao("Confirmar exclusão"))
      assert.equal(requisicoes[4].opcoes.method, "DELETE")
      await act(async () => requisicoes[4].resolve(new Response(null, { status: 204 })))

      await clicar(botao("Tarefas"))
      await selecionar(0, idTarefa)
      assert.equal(formulario.querySelectorAll("select")[1].value, "")
      await clicar(botao("Excluir do servidor"))
      await clicar(botao("Confirmar exclusão"))
      assert.equal(requisicoes[5].rota, "/api/tarefas/" + idTarefa)
      assert.equal(requisicoes[5].opcoes.method, "DELETE")
      await act(async () => requisicoes[5].resolve(new Response(null, { status: 204 })))
      assert.match(document.querySelector("details").textContent, /Nenhuma tarefa no servidor/)
      assert.equal(localStorage.length, 0)
    } finally {
      await componente.desmontar()
    }
  } finally {
    await ambiente.fechar()
  }
})

test("piloto reordena apenas dentro do grupo e limpa o servidor após confirmação", async (t) => {
  const primeira = { id: "62a43991-9ca0-4639-98d7-c849b67bf2a1", titulo: "Primeira", concluida: false, topicoId: "" }
  const outra = { id: "62a43991-9ca0-4639-98d7-c849b67bf2a2", titulo: "Outro grupo", concluida: false, topicoId: "grupo" }
  const ultima = { id: "62a43991-9ca0-4639-98d7-c849b67bf2a3", titulo: "Última", concluida: false, topicoId: "" }
  const requisicoes = []
  t.mock.method(globalThis, "fetch", (rota, opcoes) => new Promise((resolve) => {
    requisicoes.push({ rota, opcoes, resolve })
  }))
  const ambiente = await criarAmbientePaginas()
  try {
    const componente = await ambiente.montar("/src/components/tasks/ApiPreview.jsx", {}, { permiteGravar: true })
    try {
      localStorage.setItem("consumo-agua", "cópia local")
      await act(async () => {
        requisicoes[0].resolve(Response.json([primeira, outra, ultima]))
        requisicoes[1].resolve(Response.json([{ id: "grupo", nome: "Grupo" }]))
      })
      const seletor = document.querySelector("form select")
      await act(async () => {
        seletor.value = ultima.id
        seletor.dispatchEvent(new window.Event("change", { bubbles: true }))
      })
      await clicar(botao("Subir na ordem"))
      assert.equal(requisicoes[2].rota, "/api/tarefas/ordem/manual")
      assert.deepEqual(JSON.parse(requisicoes[2].opcoes.body), {
        antes: [primeira.id, outra.id, ultima.id],
        ordem: [ultima.id, outra.id, primeira.id],
      })
      await act(async () => requisicoes[2].resolve(new Response(null, { status: 204 })))
      assert.deepEqual([...document.querySelectorAll("details ul:first-of-type li")].slice(0, 3).map((item) => item.textContent), ["Última", "Outro grupo", "Primeira"])

      await clicar(botao("Limpar tarefas e tópicos do servidor"))
      assert.equal(requisicoes.length, 3)
      await clicar(botao("Confirmar limpeza"))
      assert.equal(requisicoes[3].rota, "/api/registros/limpeza")
      await act(async () => requisicoes[3].resolve(Response.json({ erro: "Os registros mudaram." }, { status: 409 })))
      assert.match(document.querySelector('[role="alert"]').textContent, /registros mudaram/)
      assert.match(document.querySelector("details").textContent, /Última/)

      await clicar(botao("Confirmar limpeza"))
      await act(async () => requisicoes[4].resolve(new Response(null, { status: 204 })))
      assert.match(document.querySelector("details").textContent, /Nenhuma tarefa no servidor/)
      assert.equal(localStorage.getItem("consumo-agua"), "cópia local")
    } finally {
      await componente.desmontar()
    }
  } finally {
    await ambiente.fechar()
  }
})
