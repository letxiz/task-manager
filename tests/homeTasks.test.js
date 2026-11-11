import test from "node:test"
import assert from "node:assert/strict"
import { resumirTarefas, paginarTarefas } from "../src/utils/homeTasks.js"

test("lista vazia produz contadores e progresso zerados", () => {
  assert.deepEqual(resumirTarefas([]), { total: 0, concluidas: 0, porcentagem: 0, visiveis: [] })
})

test("prévia prioriza pendentes e prazos, sem alterar a lista salva", () => {
  const tarefas = [
    { id: "1", concluida: true, data: "2026-10-01" },
    { id: "2", concluida: false, data: "" },
    { id: "3", concluida: false, data: "2026-11-05" },
    { id: "4", concluida: false, data: "2026-11-03" },
    { id: "5", concluida: false, data: "2026-11-04" },
    { id: "6", concluida: true, data: "" },
  ]
  const antes = structuredClone(tarefas)
  const resumo = resumirTarefas(tarefas)
  assert.equal(resumo.total, 6)
  assert.equal(resumo.concluidas, 2)
  assert.equal(resumo.porcentagem, 33)
  assert.deepEqual(resumo.visiveis.map((item) => item.id), ["4", "5", "3", "2", "1"])
  assert.deepEqual(tarefas, antes)
})

test("concluir, reabrir e excluir refletem no resumo", () => {
  const tarefa = { id: "1", concluida: false }
  assert.equal(resumirTarefas([tarefa]).porcentagem, 0)
  assert.equal(resumirTarefas([{ ...tarefa, concluida: true }]).porcentagem, 100)
  assert.equal(resumirTarefas([tarefa]).concluidas, 0)
  assert.equal(resumirTarefas([]).total, 0)
})


test("paginação permite acessar todas as tarefas em páginas de seis", () => {
  const tarefas = Array.from({ length: 13 }, (_, index) => ({ id: String(index), concluida: false }))
  const paginas = [1, 2, 3].map((pagina) => paginarTarefas(tarefas, pagina))
  assert.deepEqual(paginas.map((pagina) => pagina.visiveis.length), [6, 6, 1])
  assert.deepEqual(paginas.flatMap((pagina) => pagina.visiveis), tarefas)
  assert.equal(paginas[2].primeiro, 13)
  assert.equal(paginas[2].ultimo, 13)
  assert.equal(paginas[0].totalPaginas, 3)
})

test("página é ajustada após remoções e lista vazia não gera página inválida", () => {
  const tarefas = Array.from({ length: 6 }, (_, index) => ({ id: String(index), concluida: index === 0 }))
  const pagina = paginarTarefas(tarefas, 2)
  assert.equal(pagina.paginaAtual, 1)
  assert.equal(pagina.total, 6)
  assert.equal(pagina.concluidas, 1)
  assert.equal(pagina.visiveis.length, 6)
  const vazia = paginarTarefas([], 3)
  assert.equal(vazia.paginaAtual, 1)
  assert.equal(vazia.totalPaginas, 1)
  assert.equal(vazia.primeiro, 0)
  assert.equal(vazia.ultimo, 0)
  assert.deepEqual(vazia.visiveis, [])
})
