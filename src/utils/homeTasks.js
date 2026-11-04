export function resumirTarefas(tarefas, limite = 5) {
  const concluidas = tarefas.filter((tarefa) => tarefa.concluida).length
  const total = tarefas.length
  // Prioriza pendentes e prazos.
  const visiveis = [...tarefas].sort((a, b) => {
    if (a.concluida !== b.concluida) return a.concluida ? 1 : -1
    return (a.data || "9999-12-31").localeCompare(b.data || "9999-12-31")
  }).slice(0, limite)
  return { total, concluidas, porcentagem: total ? Math.round((concluidas / total) * 100) : 0, visiveis }
}
