import test from "node:test"
import assert from "node:assert/strict"
import { idValido, dataISOValida, recuperarTarefas, recuperarTopicos } from "../src/utils/taskSchema.js"

const tarefa = { id: "antigo-1", titulo: "Tarefa antiga", concluida: false }
const topico = { id: "antigo-1", nome: "Tópico antigo" }

test("IDs aceitam formatos antigos e Unicode, mas rejeitam vazios, espaços, controles e outros tipos", () => {
  for (const id of ["1", "antigo-1", "tópico-ação", "__proto__", "constructor", "task:a", "unassigned-tasks"]) assert.equal(idValido(id), true)
  for (const id of ["", " ", " a", "a ", "a b", "a\tb", "a\nb", "a\u0000b", "a\u0085b", null, undefined, 1, {}, []]) assert.equal(idValido(id), false)
})

test("datas validam tipos, calendário, ano mínimo e ano bissexto", () => {
  for (const data of ["2024-02-29", "2026-11-12", "1000-01-01"]) assert.equal(dataISOValida(data), true)
  for (const data of ["2026-02-29", "2026-02-30", "2026-13-01", "2026-11-31", "0999-01-01", "2026-1-1", "", null, 20261112, {}]) assert.equal(dataISOValida(data), false)
})

test("dados antigos sem campos opcionais continuam válidos sem inventar IDs ou status", () => {
  assert.deepEqual(recuperarTarefas([tarefa]), { itens: [tarefa], invalido: false })
  assert.deepEqual(recuperarTopicos([topico]), { itens: [topico], invalido: false })
  const resultado = recuperarTarefas([tarefa, { id: "sem-status", titulo: "Incompleta" }, { ...tarefa, id: "status-inválido", concluida: "false" }])
  assert.deepEqual(resultado.itens, [tarefa])
  assert.equal(resultado.invalido, true)
})

test("campos obrigatórios inválidos não impedem recuperar os demais registros", () => {
  const tarefas = [null, [], 1, "texto", {}, { ...tarefa, titulo: " " }, { ...tarefa, titulo: {} }, tarefa]
  const topicos = [null, [], {}, { ...topico, nome: " " }, { ...topico, nome: [] }, topico]
  assert.deepEqual(recuperarTarefas(tarefas), { itens: [tarefa], invalido: true })
  assert.deepEqual(recuperarTopicos(topicos), { itens: [topico], invalido: true })
})

test("recuperação não altera registros originais nem seus campos extras", () => {
  const original = Object.freeze({ ...tarefa, descricao: 3, data: [], topicoId: {}, cor: null, extra: { preservado: true } })
  const resultado = recuperarTarefas(Object.freeze([original]))
  assert.deepEqual(resultado.itens[0], { ...tarefa, descricao: "", data: "", topicoId: "", extra: original.extra })
  assert.equal(original.descricao, 3)
  assert.deepEqual(original.data, [])
  assert.equal(original.cor, null)
  assert.equal(resultado.invalido, true)
})

test("primeira ocorrência válida mantém a identidade e os namespaces do dnd-kit não colidem", () => {
  const tarefas = recuperarTarefas([{ ...tarefa, titulo: "" }, tarefa, { ...tarefa, titulo: "Duplicada" }, { ...tarefa, id: "topic:antigo-1" }]).itens
  const topicos = recuperarTopicos([topico, { ...topico, nome: "Duplicado" }]).itens
  assert.equal(tarefas[0].titulo, tarefa.titulo)
  assert.equal(topicos[0].nome, topico.nome)
  const ids = [...tarefas.map((item) => `task:${item.id}`), ...topicos.map((item) => `topic:${item.id}`), "unassigned-tasks"]
  assert.equal(new Set(ids).size, ids.length)
})
