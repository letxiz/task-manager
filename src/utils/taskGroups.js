// Índices da lista completa, compartilhados pela apresentação e pelo arraste.
// Os arrays seguem a ordem manual e mantêm os objetos originais.
export function indexarTarefas(tarefas, topicos) {
  const indicesTopicos = new Map()
  const porTopico = new Map()
  topicos.forEach((topico, indice) => {
    if (!indicesTopicos.has(topico.id)) indicesTopicos.set(topico.id, indice)
    porTopico.set(topico.id, [])
  })
  const tarefasPorId = new Map()
  const tarefasSemTopico = []
  for (const tarefa of tarefas) {
    if (!tarefasPorId.has(tarefa.id)) tarefasPorId.set(tarefa.id, tarefa)
    const topicoId = tarefa.topicoId
    const grupo = porTopico.get(topicoId)
    if (grupo) grupo.push(tarefa)
    if (!topicoId || !indicesTopicos.has(topicoId)) tarefasSemTopico.push(tarefa)
  }
  return { indicesTopicos, porTopico, tarefasPorId, tarefasSemTopico }
}

export function agruparTarefasVisiveis(indice, tarefasVisiveis) {
  const porTopico = new Map()
  for (const tarefa of tarefasVisiveis) {
    const topicoId = tarefa.topicoId
    if (!porTopico.has(topicoId)) porTopico.set(topicoId, [])
    porTopico.get(topicoId).push(tarefa)
  }
  const visiveis = new Set(tarefasVisiveis)
  // Preserva a ordem da lista completa e a comparação por referência do includes
  // anterior, inclusive para tarefas cujo tópico foi removido.
  const tarefasSemTopico = indice.tarefasSemTopico.filter((tarefa) => visiveis.has(tarefa))
  return { porTopico, tarefasSemTopico }
}
