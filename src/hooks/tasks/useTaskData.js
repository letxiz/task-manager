import { useContext, useMemo } from "react"
import { TaskContext, TaskActionsContext } from "../../contexts/TaskContext.js"

export function useTaskActions() {
  const acoes = useContext(TaskActionsContext)
  if (!acoes) throw new Error("useTaskActions requer TaskProvider")
  return acoes
}

export function useTaskData() {
  const dados = useContext(TaskContext)
  const acoes = useContext(TaskActionsContext)
  if (!dados || !acoes) throw new Error("useTaskData requer TaskProvider")
  // Mantém a interface combinada das páginas existentes.
  return useMemo(() => ({ ...dados, ...acoes }), [dados, acoes])
}
