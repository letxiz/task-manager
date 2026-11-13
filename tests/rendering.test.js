import test, { after } from "node:test"
import assert from "node:assert/strict"
import { carregarDocumentoTarefas, TASK_DOCUMENT_KEY } from "../src/utils/taskStorage.js"
import { diaLocal } from "../src/utils/waterStorage.js"
import { paginarTarefas } from "../src/utils/homeTasks.js"
import { criarAmbientePaginas, clicar, preencher, botao, enviar } from "./helpers/reactPage.js"

const ambiente = await criarAmbientePaginas()
after(() => ambiente.fechar())

for (const [nome, caminho] of [["Tasks", "/src/routes/(app)/Tasks.jsx"], ["Home", "/src/routes/(app)/Home.jsx"]]) {
  test(`${nome}: mede trabalho na lista durante digitação do formulário`, async () => {
    let leituras = 0
    const tarefas = Array.from({ length: 120 }, (_, index) => ({
      id: String(index),
      get titulo() { leituras += 1; return `Tarefa ${index}` },
      get concluida() { leituras += 1; return false },
      data: `2026-11-${String(index % 28 + 1).padStart(2, "0")}`,
      descricao: "", topicoId: "",
    }))
    let enviado
    const salvar = (...args) => { enviado = args; return { erro: "", salvo: true } }
    const dados = { tarefas, topicos: [], erroArmazenamento: "", alternarConclusao() {}, excluirTarefa() {}, moverTarefa() {}, reordenarTarefas() {}, reordenarTopicos() {}, excluirTopico() {}, limparDados() {}, criarTarefa: salvar, editarTarefa: salvar, criarTopico() {}, editarTopico() {}, criarTopicoComTarefasSemTopico() {} }
    const app = await ambiente.montar(caminho, dados)
    try {
      if (nome === "Tasks") await clicar(botao("Nova tarefa"))
      else {
        await clicar(document.querySelector('[aria-label="Ver detalhes da tarefa Tarefa 0"]') ?? document.querySelector('button[aria-label^="Ver detalhes"]'))
        await clicar(botao("Editar tarefa") ?? botao("Editar"))
      }
      assert.ok(document.querySelector("#titulo"))
      leituras = 0
      for (const valor of ["A", "Ab", "Abc", "Abcd", "Abcde"]) await preencher(document.querySelector("#titulo"), valor)
      assert.equal(document.querySelector("#titulo").value, "Abcde")
      assert.equal(leituras, 0, "Digitar no formulário não deve percorrer a lista")
      await enviar(document.querySelector("#titulo").closest("form"))
      assert.equal(enviado.at(-1).titulo, "Abcde")
      assert.equal(document.querySelector("#titulo"), null)
      console.log(`${nome}: leituras de título/conclusão em 5 digitações com 120 tarefas = ${leituras}`)
    } finally {
      await app.desmontar()
    }
  })
}

test("Home: mede trabalho de ordenação ao trocar de página", async () => {
  let leituras = 0
  const tarefas = Array.from({ length: 120 }, (_, index) => ({
    id: String(index), titulo: `Tarefa ${index}`, concluida: false,
    get data() { leituras += 1; return `2026-11-${String(index % 28 + 1).padStart(2, "0")}` },
    topicoId: "",
  }))
  const dados = { tarefas, topicos: [], erroArmazenamento: "", alternarConclusao() {} }
  const app = await ambiente.montar("/src/routes/(app)/Home.jsx", dados)
  try {
    leituras = 0
    for (let indice = 0; indice < 5; indice += 1) await clicar(botao("Próxima página"))
    assert.ok(leituras < 120 * 5, "Paginação deve ler apenas itens visíveis, sem ordenar toda a coleção")
    console.log(`Home: leituras de data em 5 trocas de página com 120 tarefas = ${leituras}`)
    assert.deepEqual([...document.querySelectorAll('button[aria-label^="Ver detalhes"]')].map((item) => item.getAttribute("aria-label")), paginarTarefas(tarefas, 6).visiveis.map((item) => `Ver detalhes da tarefa ${item.titulo}`))
  } finally {
    await app.desmontar()
  }
})

function dadosDaPagina(tarefas = []) {
  return { tarefas, topicos: [], erroArmazenamento: "", alternarConclusao() {}, excluirTarefa() {}, moverTarefa() {}, reordenarTarefas() {}, reordenarTopicos() {}, excluirTopico() {}, limparDados() {}, criarTarefa() { return { erro: "", salvo: true } }, editarTarefa() { return { erro: "", salvo: true } }, criarTopico() { return { erro: "", salvo: true } }, editarTopico() { return { erro: "", salvo: true } }, criarTopicoComTarefasSemTopico() { return { erro: "", salvo: true } } }
}

test("Tasks: busca, filtros e novos dados invalidam o resultado memorizado", async () => {
  const dados = dadosDaPagina([
    { id: "1", titulo: "Revisar relatório", descricao: "Financeiro", concluida: false },
    { id: "2", titulo: "Compras", descricao: "Mercado", concluida: true },
    { id: "3", titulo: "Reunião", descricao: "Equipe", concluida: false },
  ])
  const app = await ambiente.montar("/src/routes/(app)/Tasks.jsx", dados)
  const quantidade = () => document.querySelectorAll('input[type="checkbox"]').length
  try {
    assert.equal(quantidade(), 3)
    await clicar([...document.querySelectorAll('button[aria-pressed]')].find((item) => item.textContent.startsWith("Pendentes")))
    assert.equal(quantidade(), 2)
    await preencher(document.querySelector("#task-search"), " FINANCEIRO ")
    assert.equal(quantidade(), 1)
    await preencher(document.querySelector("#task-search"), "não existe")
    assert.equal(quantidade(), 0)
    assert.ok(document.body.textContent.includes("Nenhuma tarefa encontrada."))
    await clicar(botao("Limpar busca"))
    assert.equal(quantidade(), 2)
    await app.renderizar({ ...dados, tarefas: dados.tarefas.map((item) => ({ ...item, concluida: true })) })
    assert.equal(quantidade(), 0)
    await clicar([...document.querySelectorAll('button[aria-pressed]')].find((item) => item.textContent.startsWith("Concluídas")))
    assert.equal(quantidade(), 3)
  } finally {
    await app.desmontar()
  }
})

test("Tasks: digitar no tópico não percorre tarefas e mantém o envio e reabertura", async () => {
  let leituras = 0
  let enviado
  const dados = dadosDaPagina(Array.from({ length: 20 }, (_, index) => ({ id: String(index), get titulo() { leituras += 1; return `Tarefa ${index}` }, concluida: false })))
  dados.criarTopico = (campos) => { enviado = campos; return { erro: "", salvo: true } }
  const app = await ambiente.montar("/src/routes/(app)/Tasks.jsx", dados)
  try {
    await clicar(botao("Ações de tarefas"))
    await clicar(botao("Novo tópico"))
    leituras = 0
    await preencher(document.querySelector("#topic-name"), "Trabalho")
    assert.equal(leituras, 0)
    await enviar(document.querySelector("#topic-name").closest("form"))
    assert.equal(enviado.nome, "Trabalho")
    assert.equal(document.querySelector("#topic-name").closest("dialog").open, false)
    await clicar(botao("Ações de tarefas"))
    await clicar(botao("Novo tópico"))
    assert.equal(document.querySelector("#topic-name").value, "")
    assert.equal(document.querySelector("#topic-name").closest("dialog").open, true)
  } finally {
    await app.desmontar()
  }
})

test("Home: alterações na lista recalculam prioridade e ajustam a página após exclusões", async () => {
  const dados = dadosDaPagina(Array.from({ length: 13 }, (_, index) => ({ id: String(index), titulo: `Tarefa ${index}`, concluida: false, data: "" })))
  const app = await ambiente.montar("/src/routes/(app)/Home.jsx", dados)
  const detalhes = () => [...document.querySelectorAll('button[aria-label^="Ver detalhes"]')].map((item) => item.getAttribute("aria-label"))
  try {
    await clicar(botao("Próxima página"))
    await clicar(botao("Próxima página"))
    assert.deepEqual(detalhes(), ["Ver detalhes da tarefa Tarefa 12"])
    const restantes = dados.tarefas.slice(0, 2)
    await app.renderizar({ ...dados, tarefas: restantes })
    assert.equal(detalhes().length, 2)
    assert.equal(botao("Próxima página"), undefined)
    await app.renderizar({ ...dados, tarefas: dados.tarefas })
    assert.equal(botao("Página anterior").disabled, true)
    await app.renderizar({ ...dados, tarefas: dados.tarefas.map((item) => item.id === "0" ? { ...item, concluida: true } : item) })
    assert.equal(detalhes()[0], "Ver detalhes da tarefa Tarefa 1")
  } finally {
    await app.desmontar()
  }
})

test("Home: registrar água não renderiza a lista de tarefas novamente", async () => {
  let leituras = 0
  const dados = dadosDaPagina(Array.from({ length: 120 }, (_, index) => ({
    id: String(index), get titulo() { leituras += 1; return `Tarefa ${index}` },
    get concluida() { leituras += 1; return false }, data: "",
  })))
  const app = await ambiente.montar("/src/routes/(app)/Home.jsx", dados)
  try {
    leituras = 0
    await clicar(botao("Registrar 250 ml de água"))
    assert.equal(leituras, 0)
    assert.ok(localStorage.length > 0)
  } finally {
    await app.desmontar()
  }
})

test("Home: a lista memorizada atualiza os prazos quando o dia muda", async (t) => {
  const inicio = new Date(2026, 10, 12, 12).getTime()
  t.mock.timers.enable({ apis: ["Date"], now: inicio })
  const dados = dadosDaPagina([{ id: "1", titulo: "Entrega", concluida: false, data: diaLocal() }])
  const app = await ambiente.montar("/src/routes/(app)/Home.jsx", dados)
  try {
    assert.ok(document.body.textContent.includes("Hoje"))
    t.mock.timers.setTime(inicio + 24 * 60 * 60 * 1000)
    await clicar(botao("Registrar 250 ml de água"))
    assert.ok(document.body.textContent.includes("Prazo vencido"))
  } finally {
    await app.desmontar()
  }
})

test("Tasks: mede buscas de agrupamento com 120 tarefas e 12 tópicos", async () => {
  let leituras = 0
  const dados = dadosDaPagina(Array.from({ length: 120 }, (_, index) => ({
    id: String(index), titulo: `Tarefa ${index}`, concluida: false,
    get topicoId() { leituras += 1; return index % 5 === 0 ? "" : `t${index % 12}` },
  })))
  dados.topicos = Array.from({ length: 12 }, (_, index) => ({
    get id() { leituras += 1; return `t${index}` }, nome: `Tópico ${index}`, cor: "blue",
  }))
  const app = await ambiente.montar("/src/routes/(app)/Tasks.jsx", dados)
  try {
    assert.ok(leituras < 120 * 12, "Agrupamento deve evitar um percurso completo por tópico")
    console.log(`Tasks: leituras de vínculo/ID de tópico no agrupamento inicial = ${leituras}`)
    assert.equal(document.querySelectorAll('input[type="checkbox"]').length, 120)
  } finally {
    await app.desmontar()
  }
})

test("Tasks: grupos filtrados preservam tópicos vazios e a seção Sem tópico", async () => {
  const dados = dadosDaPagina([
    { id: "1", titulo: "Relatório", concluida: false, topicoId: "a" },
    { id: "2", titulo: "Compras", concluida: false, topicoId: "b" },
    { id: "3", titulo: "Órfã", concluida: false, topicoId: "removido" },
  ])
  dados.topicos = [{ id: "a", nome: "Trabalho" }, { id: "b", nome: "Casa" }, { id: "vazio", nome: "Vazio" }]
  const app = await ambiente.montar("/src/routes/(app)/Tasks.jsx", dados)
  const grupos = () => [...document.querySelectorAll('section[aria-labelledby^="topic-"]')].map((item) => item.getAttribute("aria-labelledby"))
  try {
    assert.deepEqual(grupos(), ["topic-a", "topic-b", "topic-vazio"])
    assert.ok(document.querySelector("#unassigned-title"))
    await preencher(document.querySelector("#task-search"), "relatório")
    assert.deepEqual(grupos(), ["topic-a"])
    assert.equal(document.querySelector("#unassigned-title"), null)
    await preencher(document.querySelector("#task-search"), "órfã")
    assert.deepEqual(grupos(), [])
    assert.ok(document.querySelector("#unassigned-title"))
    await clicar(botao("Limpar busca"))
    assert.deepEqual(grupos(), ["topic-a", "topic-b", "topic-vazio"])
    assert.equal(document.querySelectorAll('input[type="checkbox"]').length, 3)
  } finally {
    await app.desmontar()
  }
})

test("Tasks: dados recuperados renderizam sem keys duplicadas ou identificadores conflitantes", async (t) => {
  const documento = JSON.stringify({
    versao: 1,
    tarefas: [
      { id: "igual", titulo: "Preservada", concluida: false, topicoId: "igual" },
      { id: "igual", titulo: "Duplicada", concluida: false, topicoId: "igual" },
      { id: "outra", titulo: "Recuperada", concluida: false, descricao: {}, data: {}, topicoId: 4 },
    ],
    topicos: [{ id: "igual", nome: "Grupo" }, { id: "igual", nome: "Grupo duplicado" }, { id: " ", nome: "Inválido" }],
  })
  const recuperados = carregarDocumentoTarefas({ getItem: (chave) => chave === TASK_DOCUMENT_KEY ? documento : null })
  const dados = { ...dadosDaPagina(recuperados.tarefas), topicos: recuperados.topicos, erroArmazenamento: recuperados.erro }
  const erros = []
  t.mock.method(console, "error", (...args) => erros.push(args.join(" ")))
  const app = await ambiente.montar("/src/routes/(app)/Tasks.jsx", dados)
  try {
    assert.equal(document.querySelectorAll('input[type="checkbox"]').length, 2)
    assert.equal(document.querySelectorAll('section[aria-labelledby="topic-igual"]').length, 1)
    assert.ok(document.querySelector("#unassigned-title"))
    assert.match(document.querySelector('[role="alert"]').textContent, /gravação está bloqueada/)
    assert.deepEqual(erros, [])
  } finally {
    await app.desmontar()
  }
})
