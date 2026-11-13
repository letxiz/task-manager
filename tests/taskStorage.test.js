import test from "node:test"
import assert from "node:assert/strict"
import { carregarDocumentoTarefas, salvarDocumentoTarefas, TASK_DOCUMENT_KEY } from "../src/utils/taskStorage.js"

const tarefa = { id: "1", titulo: "Teste", concluida: false, topicoId: "a" }
const topico = { id: "a", nome: "A", cor: "blue" }
const dados = { tarefas: [tarefa], topicos: [topico] }
function armazenamento(inicial = {}) {
  const valores = new Map(Object.entries(inicial))
  return { valores, getItem: (chave) => valores.get(chave) ?? null, setItem: (chave, valor) => valores.set(chave, valor) }
}

test("primeiro acesso não grava nem migra automaticamente", () => {
  const storage = armazenamento()
  assert.deepEqual(carregarDocumentoTarefas(storage), { tarefas: [], topicos: [], erro: "" })
  assert.equal(storage.valores.size, 0)
})

test("migração lê o legado e preserva suas duas cópias na primeira gravação", () => {
  const legado = { "minhas-tarefas": JSON.stringify(dados.tarefas), "meus-topicos": JSON.stringify(dados.topicos) }
  const storage = armazenamento(legado)
  assert.deepEqual(carregarDocumentoTarefas(storage), { ...dados, erro: "" })
  assert.equal(storage.valores.size, 2)
  assert.deepEqual(salvarDocumentoTarefas(dados, storage), { erro: "" })
  for (const [chave, valor] of Object.entries(legado)) assert.equal(storage.getItem(chave), valor)
  assert.deepEqual(JSON.parse(storage.getItem(TASK_DOCUMENT_KEY)), { versao: 1, ...dados })
  assert.deepEqual(carregarDocumentoTarefas(storage), { ...dados, erro: "" })
})

test("documento novo tem precedência mesmo vazio, sem ressuscitar dados legados", () => {
  const storage = armazenamento({ "minhas-tarefas": JSON.stringify([tarefa]), "meus-topicos": JSON.stringify([topico]) })
  salvarDocumentoTarefas({ tarefas: [], topicos: [] }, storage)
  assert.deepEqual(carregarDocumentoTarefas(storage), { tarefas: [], topicos: [], erro: "" })
})

test("falha de migração mantém legado recuperável sem documento parcial", () => {
  const storage = armazenamento({ "minhas-tarefas": JSON.stringify([tarefa]), "meus-topicos": JSON.stringify([topico]) })
  storage.setItem = () => { throw new Error("Quota") }
  assert.ok(salvarDocumentoTarefas(dados, storage).erro)
  assert.equal(storage.getItem(TASK_DOCUMENT_KEY), null)
  assert.deepEqual(carregarDocumentoTarefas(storage), { ...dados, erro: "" })
})

test("falha em substituir documento mantém a última versão completa", () => {
  const storage = armazenamento()
  salvarDocumentoTarefas(dados, storage)
  storage.setItem = () => { throw new Error("Bloqueado") }
  assert.ok(salvarDocumentoTarefas({ tarefas: [], topicos: [] }, storage).erro)
  assert.deepEqual(carregarDocumentoTarefas(storage), { ...dados, erro: "" })
})

test("documentos corrompidos, incompletos e de versão futura são preservados com aviso", () => {
  for (const valor of ["inválido", "null", "{}", JSON.stringify({ versao: 2, ...dados }), JSON.stringify({ versao: 1, tarefas: [] })]) {
    const storage = armazenamento({ [TASK_DOCUMENT_KEY]: valor })
    assert.ok(carregarDocumentoTarefas(storage).erro)
    assert.equal(storage.getItem(TASK_DOCUMENT_KEY), valor)
  }
})

test("erros de leitura e JSON legado inválido são explícitos e preservam a coleção legível", () => {
  assert.ok(carregarDocumentoTarefas({ getItem: () => { throw new Error("Bloqueado") } }).erro)
  for (const valor of ["inválido", "{}", "[null]"]) {
    const storage = armazenamento({ "minhas-tarefas": JSON.stringify([tarefa]), "meus-topicos": valor })
    const carregado = carregarDocumentoTarefas(storage)
    assert.deepEqual(carregado.tarefas, [tarefa])
    assert.ok(carregado.erro)
    assert.equal(storage.getItem("meus-topicos"), valor)
  }
})

test("falha de serialização não substitui dados persistidos", () => {
  const storage = armazenamento()
  salvarDocumentoTarefas(dados, storage)
  const circular = []
  circular.push(circular)
  assert.ok(salvarDocumentoTarefas({ tarefas: circular, topicos: [] }, storage).erro)
  assert.deepEqual(carregarDocumentoTarefas(storage), { ...dados, erro: "" })
})
