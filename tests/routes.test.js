import test, { after } from "node:test"
import assert from "node:assert/strict"
import { act } from "react"
import { criarAmbientePaginas, clicar, preencher, enviar, botao } from "./helpers/reactPage.js"

let liberar
const pendente = new Promise((resolve) => { liberar = resolve })
const ambiente = await criarAmbientePaginas({ antesDeCarregarTarefas: () => pendente })
after(() => ambiente.fechar())

async function aguardarPagina(titulo) {
  for (let tentativa = 0; tentativa < 100; tentativa += 1) {
    if (document.querySelector("h1")?.textContent === titulo) return
    await act(async () => new Promise((resolve) => setTimeout(resolve, 10)))
  }
  assert.equal(document.querySelector("h1")?.textContent, titulo)
}

test("acesso direto a /tasks mantém navegação e mostra status enquanto carrega o módulo", async () => {
  const app = await ambiente.montarApp("/tasks")
  try {
    assert.ok(document.querySelector('[role="status"]').textContent.includes("Carregando tarefas"))
    assert.ok(document.querySelector('#sidebar-navigation a[href="/"]'))
    assert.ok(document.querySelector("#main-content"))
    await act(async () => liberar())
    await aguardarPagina("Minhas Tarefas")
    assert.equal(document.body.textContent.includes("Carregando tarefas…"), false)
  } finally {
    liberar()
    await app.desmontar()
  }
})

test("navegação entre início e tarefas mantém os dados, conclusão e histórico", async () => {
  const app = await ambiente.montarApp()
  try {
    assert.equal(document.querySelector("h1").textContent, "Início")
    await clicar(botao("Criar tarefa"))
    await preencher(document.querySelector("#titulo"), "Persistente")
    await enviar(document.querySelector("#titulo").closest("form"))
    await clicar(document.querySelector('#sidebar-navigation a[href="/tasks"]'))
    await aguardarPagina("Minhas Tarefas")
    await clicar(document.querySelector('input[aria-label="Concluir Persistente"]'))
    await app.navegar(-1)
    assert.equal(document.querySelector("h1").textContent, "Início")
    assert.equal(document.querySelector('input[aria-label="Reabrir tarefa Persistente"]').checked, true)
    await app.navegar(1)
    assert.equal(document.querySelector("h1").textContent, "Minhas Tarefas")
    assert.equal(document.querySelector('input[aria-label="Reabrir Persistente"]').checked, true)
    const salvo = JSON.parse(localStorage.getItem("task-manager:dados"))
    assert.equal(salvo.tarefas[0].titulo, "Persistente")
    assert.equal(salvo.tarefas[0].concluida, true)
  } finally {
    await app.desmontar()
  }
})

test("rota desconhecida mantém 404 e retorno ao início", async () => {
  const app = await ambiente.montarApp("/nao-existe")
  try {
    assert.equal(document.querySelector("h1").textContent, "Página não encontrada")
    await clicar([...document.querySelectorAll("a")].find((item) => item.textContent === "Voltar para o início"))
    assert.equal(document.querySelector("h1").textContent, "Início")
  } finally {
    await app.desmontar()
  }
})

test("início em sessão nova só solicita tarefas após navegar para /tasks", async () => {
  let carregamentos = 0
  const frio = await criarAmbientePaginas({ antesDeCarregarTarefas: () => { carregamentos += 1 } })
  const app = await frio.montarApp()
  try {
    assert.equal(document.querySelector("h1").textContent, "Início")
    assert.equal(carregamentos, 0)
    await app.navegar("/tasks")
    await aguardarPagina("Minhas Tarefas")
    assert.equal(carregamentos, 1)
  } finally {
    await app.desmontar()
    await frio.fechar()
  }
})

test("falha ao carregar tarefas preserva navegação e dados do Provider", async (t) => {
  const falha = await criarAmbientePaginas({ antesDeCarregarTarefas: () => { throw new Error("Falha simulada do módulo") } })
  t.mock.method(console, "error", () => {})
  const salvos = { "task-manager:dados": JSON.stringify({ versao: 1, tarefas: [{ id: "1", titulo: "Preservada", concluida: false }], topicos: [] }) }
  const app = await falha.montarApp("/tasks", salvos)
  try {
    for (let tentativa = 0; tentativa < 100 && !document.querySelector('[role="alert"]'); tentativa += 1) {
      await act(async () => new Promise((resolve) => setTimeout(resolve, 10)))
    }
    assert.match(document.querySelector('[role="alert"]').textContent, /Não foi possível abrir as tarefas/)
    assert.ok(document.querySelector('#sidebar-navigation a[href="/"]'))
    await clicar([...document.querySelectorAll("a")].find((item) => item.textContent === "Voltar para o início"))
    assert.equal(document.querySelector("h1").textContent, "Início")
    assert.ok(document.querySelector('input[aria-label="Concluir tarefa Preservada"]'))
    assert.equal(localStorage.getItem("task-manager:dados"), salvos["task-manager:dados"])
  } finally {
    await app.desmontar()
    await falha.fechar()
  }
})
