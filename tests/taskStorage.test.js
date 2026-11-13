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

for (const legado of [false, true]) {
  test(`recupera registros válidos com IDs inválidos ou duplicados (legado: ${legado})`, () => {
    const tarefas = [tarefa, { ...tarefa, titulo: "Duplicada" }, ...["", " ", "a b", "a\nb", 3, null].map((id) => ({ ...tarefa, id })), { ...tarefa, id: "2", titulo: "Segunda" }]
    const topicos = [topico, { ...topico, nome: "Duplicado" }, ...["", " ", "a b", "a\nb", 3, null].map((id) => ({ ...topico, id })), { ...topico, id: "b", nome: "B" }]
    const original = legado
      ? { "minhas-tarefas": JSON.stringify(tarefas), "meus-topicos": JSON.stringify(topicos) }
      : { [TASK_DOCUMENT_KEY]: JSON.stringify({ versao: 1, tarefas, topicos }) }
    const storage = armazenamento(original)
    const atual = carregarDocumentoTarefas(storage)
    assert.deepEqual(atual.tarefas.map((item) => item.id), ["1", "2"])
    assert.deepEqual(atual.topicos.map((item) => item.id), ["a", "b"])
    assert.equal(atual.tarefas[0].titulo, tarefa.titulo)
    assert.equal(atual.topicos[0].nome, topico.nome)
    assert.ok(atual.erro)
    assert.deepEqual(Object.fromEntries(storage.valores), original)
  })
}

test("documento incompleto preserva a coleção que ainda pode ser lida", () => {
  for (const documento of [{ versao: 1, tarefas: [tarefa] }, { versao: 1, tarefas: [tarefa], topicos: null }]) {
    const original = JSON.stringify(documento)
    const storage = armazenamento({ [TASK_DOCUMENT_KEY]: original })
    const atual = carregarDocumentoTarefas(storage)
    assert.deepEqual(atual.tarefas, [tarefa])
    assert.deepEqual(atual.topicos, [])
    assert.ok(atual.erro)
    assert.equal(storage.getItem(TASK_DOCUMENT_KEY), original)
  }
})

test("campos opcionais inválidos são recuperados em memória sem regravar o original", () => {
  const documento = { versao: 1, tarefas: [{ ...tarefa, descricao: {}, data: "2026-02-30", topicoId: 4, cor: [] }], topicos: [{ ...topico, cor: {} }] }
  const original = JSON.stringify(documento)
  const storage = armazenamento({ [TASK_DOCUMENT_KEY]: original })
  const atual = carregarDocumentoTarefas(storage)
  assert.equal(atual.tarefas.length, 1)
  assert.equal(atual.tarefas[0].descricao, "")
  assert.equal(atual.tarefas[0].data, "")
  assert.equal(atual.tarefas[0].topicoId, "")
  assert.equal(atual.tarefas[0].cor, undefined)
  assert.equal(atual.topicos[0].cor, undefined)
  assert.ok(atual.erro)
  assert.equal(storage.getItem(TASK_DOCUMENT_KEY), original)
})

test("falha ao ler uma chave legada preserva a outra coleção", () => {
  const storage = { getItem(chave) {
    if (chave === "minhas-tarefas") throw new Error("Falha de leitura")
    return chave === "meus-topicos" ? JSON.stringify([topico]) : null
  } }
  const atual = carregarDocumentoTarefas(storage)
  assert.deepEqual(atual.tarefas, [])
  assert.deepEqual(atual.topicos, [topico])
  assert.match(atual.erro, /dados inválidos em tarefas/)
})

test("dados antigos válidos mantêm campos desconhecidos e vínculos órfãos recuperáveis", () => {
  const antigas = [{ id: "antiga", titulo: "Antiga", concluida: true, topicoId: "removido", extra: { futuro: "preservado" } }]
  const storage = armazenamento({ "minhas-tarefas": JSON.stringify(antigas) })
  const atual = carregarDocumentoTarefas(storage)
  assert.deepEqual(atual, { tarefas: antigas, topicos: [], erro: "" })
  assert.deepEqual(salvarDocumentoTarefas(atual, storage), { erro: "" })
  assert.deepEqual(carregarDocumentoTarefas(storage), atual)
})
