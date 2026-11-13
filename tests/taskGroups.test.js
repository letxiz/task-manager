import test from "node:test"
import assert from "node:assert/strict"
import { indexarTarefas, agruparTarefasVisiveis } from "../src/utils/taskGroups.js"

function referencia(tarefas, topicos, visiveis) {
  const semTopico = tarefas.filter((tarefa) => !tarefa.topicoId || !topicos.some((topico) => topico.id === tarefa.topicoId))
  return {
    grupos: topicos.map((topico) => [topico.id, visiveis.filter((tarefa) => tarefa.topicoId === topico.id)]),
    semTopico: semTopico.filter((tarefa) => visiveis.includes(tarefa)),
  }
}

test("índices mantêm ordem, referências, tópicos vazios e tarefas órfãs", () => {
  const topicos = Object.freeze([{ id: "a" }, { id: "b" }, { id: "vazio" }].map(Object.freeze))
  const tarefas = Object.freeze([
    { id: "1", topicoId: "b" }, { id: "2", topicoId: "a" }, { id: "3", topicoId: "b" },
    { id: "4", topicoId: "" }, { id: "5", topicoId: "removido" }, { id: "6" },
  ].map(Object.freeze))
  const indice = indexarTarefas(tarefas, topicos)
  assert.deepEqual(indice.porTopico.get("b"), [tarefas[0], tarefas[2]])
  assert.deepEqual(indice.porTopico.get("vazio"), [])
  assert.deepEqual(indice.tarefasSemTopico, tarefas.slice(3))
  assert.equal(indice.tarefasPorId.get("1"), tarefas[0])
  assert.equal(indice.indicesTopicos.get("b"), 1)
})

test("agrupamento filtrado equivale ao anterior para combinações de tópicos, filtros e ordenações", () => {
  for (const quantidadeTopicos of [0, 1, 7, 20]) {
    const topicos = Array.from({ length: quantidadeTopicos }, (_, index) => ({ id: `t${index}` }))
    const tarefas = Array.from({ length: 150 }, (_, index) => ({ id: String(index), topicoId: index % 4 === 0 ? "" : `t${index % 23}` }))
    const indice = indexarTarefas(tarefas, topicos)
    for (const visiveis of [tarefas, [], tarefas.filter((_, index) => index % 3 === 0), [...tarefas].reverse()]) {
      const esperado = referencia(tarefas, topicos, visiveis)
      const atual = agruparTarefasVisiveis(indice, visiveis)
      assert.deepEqual(topicos.map((topico) => [topico.id, atual.porTopico.get(topico.id) ?? []]), esperado.grupos)
      assert.deepEqual(atual.tarefasSemTopico, esperado.semTopico)
    }
  }
})

test("Sem tópico preserva a comparação por referência e a ordem da lista completa", () => {
  const tarefas = [{ id: "1", topicoId: "" }, { id: "2", topicoId: "removido" }]
  const indice = indexarTarefas(tarefas, [])
  assert.deepEqual(agruparTarefasVisiveis(indice, [...tarefas].reverse()).tarefasSemTopico, tarefas)
  assert.deepEqual(agruparTarefasVisiveis(indice, tarefas.map((item) => ({ ...item }))).tarefasSemTopico, [])
})

test("indexação cresce linearmente com o número de tarefas e tópicos", () => {
  for (const quantidade of [100, 1000, 10000]) {
    let leituras = 0
    const topicos = Array.from({ length: quantidade / 10 }, (_, index) => ({ get id() { leituras += 1; return `t${index}` } }))
    const tarefas = Array.from({ length: quantidade }, (_, index) => ({ id: String(index), get topicoId() { leituras += 1; return `t${index % topicos.length}` } }))
    const indice = indexarTarefas(tarefas, topicos)
    assert.ok(leituras <= quantidade + 4 * topicos.length)
    assert.equal(indice.tarefasPorId.size, quantidade)
  }
})
