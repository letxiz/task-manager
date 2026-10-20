export function dataISOValida(valor) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false
  const data = new Date(`${valor}T00:00:00`)
  const [ano, mes, dia] = valor.split("-").map(Number)
  // Rejeita dias inexistentes.
  return ano >= 1000 && data.getFullYear() === ano &&
    data.getMonth() === mes - 1 && data.getDate() === dia
}

export function carregarTarefas(storage) {
  try {
    const salvas = (storage ?? localStorage).getItem("minhas-tarefas")
    const tarefas = salvas === null ? [] : JSON.parse(salvas)
    // Valida campos e IDs únicos.
    const ids = new Set()
    if (!Array.isArray(tarefas) || !tarefas.every((tarefa) => {
      if (!tarefa || typeof tarefa !== "object" ||
          typeof tarefa.id !== "string" || !tarefa.id.trim() || ids.has(tarefa.id) ||
          typeof tarefa.titulo !== "string" || !tarefa.titulo.trim() ||
          (tarefa.descricao !== undefined && typeof tarefa.descricao !== "string") ||
          (tarefa.data !== undefined && tarefa.data !== "" && !dataISOValida(tarefa.data)) ||
          typeof tarefa.concluida !== "boolean") return false
      ids.add(tarefa.id)
      return true
    })) throw new Error("Dados inválidos")
    return { tarefas, erro: "" }
  } catch {
    // Preserva os dados inválidos.
    return {
      tarefas: [],
      erro: "Não foi possível carregar as tarefas salvas. Os dados anteriores foram preservados; adicionar tarefas substituirá a lista salva.",
    }
  }
}
