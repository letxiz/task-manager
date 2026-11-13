import test, { after } from "node:test"
import assert from "node:assert/strict"
import { act } from "react"
import { criarAmbientePaginas } from "./helpers/reactPage.js"

const ambiente = await criarAmbientePaginas()
after(() => ambiente.fechar())
const tarefas = [
  { id: "1", topicoId: "a" }, { id: "2", topicoId: "b" }, { id: "3", topicoId: "a" },
  { id: "4", topicoId: "" }, { id: "5", topicoId: "removido" }, { id: "6" },
]
const topicos = [{ id: "a", nome: "A" }, { id: "b", nome: "B" }, { id: "c", nome: "Vazio" }]
const tarefa = (taskId, topicId) => ({ kind: "task", taskId, topicId })
const topico = (topicId) => ({ kind: "topic", topicId })
const evento = (active, over) => ({ active: { data: { current: active } }, over: over ? { data: { current: over } } : null })

async function montar(t, listas = {}) {
  const chamadas = { mover: [], tarefas: [], topicos: [] }
  const props = { tarefas, topicos, ...listas, onMoveTask: (...args) => chamadas.mover.push(args), onReorderTasks: (ids) => chamadas.tarefas.push(ids), onReorderTopicos: (items) => chamadas.topicos.push(items) }
  const app = await ambiente.montarHook("/src/hooks/tasks/useTaskDrag.js", "useTaskDrag", props)
  t.after(() => app.desmontar())
  const terminar = async (active, over) => { await act(async () => app.atual.dragProps.onDragEnd(evento(active, over))) }
  return { app, props, chamadas, terminar }
}

test("reordena apenas o grupo atual, incluindo Sem tópico e tarefas órfãs", async (t) => {
  const { app, chamadas, terminar } = await montar(t)
  assert.deepEqual(app.atual.tarefasSemTopico.map((item) => item.id), ["4", "5", "6"])
  await terminar(tarefa("3", "a"), tarefa("1", "a"))
  await terminar(tarefa("6", ""), tarefa("4", ""))
  assert.deepEqual(chamadas.tarefas, [["3", "1"], ["6", "4", "5"]])
  assert.deepEqual(chamadas.mover, [])
  assert.deepEqual(tarefas.map((item) => item.id), ["1", "2", "3", "4", "5", "6"])
})

test("move entre tópicos, para tópico vazio e entre tópico e Sem tópico", async (t) => {
  const { chamadas, terminar } = await montar(t)
  await terminar(tarefa("1", "a"), tarefa("2", "b"))
  await terminar(tarefa("1", "a"), topico("c"))
  await terminar(tarefa("1", "a"), { kind: "unassigned" })
  await terminar(tarefa("4", ""), topico("a"))
  await terminar(tarefa("1", "a"), tarefa("5", ""))
  assert.deepEqual(chamadas.mover, [["1", "b"], ["1", "c"], ["1", ""], ["4", "a"], ["1", ""]])
  assert.deepEqual(chamadas.tarefas, [])
})

test("reordena tópicos sobre tópico ou tarefa e preserva os objetos", async (t) => {
  const { chamadas, terminar } = await montar(t)
  await terminar(topico("a"), topico("c"))
  await terminar(topico("a"), tarefa("2", "b"))
  assert.deepEqual(chamadas.topicos, [[topicos[1], topicos[2], topicos[0]], [topicos[1], topicos[0], topicos[2]]])
  assert.deepEqual(topicos.map((item) => item.id), ["a", "b", "c"])
})

test("soltura fora da lista, no mesmo item e alvos inválidos não acionam alterações", async (t) => {
  const { chamadas, terminar } = await montar(t)
  for (const [active, over] of [
    [tarefa("1", "a"), null], [tarefa("1", "a"), tarefa("1", "a")],
    [tarefa("1", "a"), topico("a")], [tarefa("1", "a"), { kind: "outro" }],
    [topico("a"), { kind: "unassigned" }], [topico("a"), topico("inexistente")],
    [tarefa("inexistente", "a"), tarefa("1", "a")], [{ kind: "outro" }, topico("a")],
  ]) await terminar(active, over)
  assert.deepEqual(chamadas, { mover: [], tarefas: [], topicos: [] })
})

test("prévia usa a tarefa e dimensões atuais; cancelamento e soltura limpam a prévia", async (t) => {
  const { app, terminar } = await montar(t)
  const inicio = (dados) => ({ active: { data: { current: dados }, rect: { current: { initial: { width: 300, height: 70 } } } } })
  await act(async () => app.atual.dragProps.onDragStart(inicio(tarefa("1", "a"))))
  assert.deepEqual(app.atual.previaArraste, { tarefa: tarefas[0], width: 300, height: 70 })
  await act(async () => app.atual.dragProps.onDragCancel())
  assert.equal(app.atual.previaArraste, null)
  await act(async () => app.atual.dragProps.onDragStart(inicio(tarefa("1", "a"))))
  await terminar(tarefa("1", "a"), null)
  assert.equal(app.atual.previaArraste, null)
  await act(async () => app.atual.dragProps.onDragStart(inicio(topico("a"))))
  assert.equal(app.atual.previaArraste, null)
})

test("novas listas atualizam agrupamento e arraste", async (t) => {
  const { app, props, chamadas, terminar } = await montar(t)
  const novasTarefas = [{ id: "nova", topicoId: "a" }, ...tarefas]
  await app.atualizar({ ...props, tarefas: novasTarefas, topicos: topicos.slice(1) })
  assert.deepEqual(app.atual.tarefasSemTopico.map((item) => item.id), ["nova", "1", "3", "4", "5", "6"])
  await terminar(tarefa("nova", ""), tarefa("6", ""))
  assert.deepEqual(chamadas.tarefas, [["1", "3", "4", "5", "6", "nova"]])
})

test("sensores preservam distância do mouse, pressão longa e suporte de teclado", async (t) => {
  const { app } = await montar(t)
  const [mouse, toque, teclado] = app.atual.dragProps.sensors
  assert.equal(mouse.sensor.name, "MouseSensor")
  assert.deepEqual(mouse.options.activationConstraint, { distance: 6 })
  assert.equal(toque.sensor.name, "TouchSensor")
  assert.deepEqual(toque.options.activationConstraint, { delay: 300, tolerance: 8 })
  assert.equal(teclado.sensor.name, "KeyboardSensor")
  assert.equal(typeof teclado.options.coordinateGetter, "function")
})

test("abrir e cancelar a prévia não refaz buscas de agrupamento", async (t) => {
  let leituras = 0
  const listas = {
    tarefas: Array.from({ length: 1000 }, (_, index) => ({ id: String(index), get topicoId() { leituras += 1; return `t${index % 100}` } })),
    topicos: Array.from({ length: 100 }, (_, index) => ({ get id() { leituras += 1; return `t${index}` } })),
  }
  const { app } = await montar(t, listas)
  leituras = 0
  await act(async () => app.atual.dragProps.onDragStart({ active: { data: { current: tarefa("1", "t1") }, rect: { current: { initial: { width: 200, height: 60 } } } } }))
  await act(async () => app.atual.dragProps.onDragCancel())
  assert.equal(leituras, 0)
})
