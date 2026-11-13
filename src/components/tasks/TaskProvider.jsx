import { useMemo } from "react"
import PropTypes from "prop-types"
import { TaskContext, TaskActionsContext } from "../../contexts/TaskContext"
import { useTaskStore } from "../../hooks/tasks/useTaskStore"

export default function TaskProvider({ children }) {
  const { tarefas, topicos, erroArmazenamento, acoes } = useTaskStore()
  const estado = useMemo(() => ({ tarefas, topicos, erroArmazenamento }), [tarefas, topicos, erroArmazenamento])
  return (
    <TaskActionsContext.Provider value={acoes}>
      <TaskContext.Provider value={estado}>{children}</TaskContext.Provider>
    </TaskActionsContext.Provider>
  )
}

TaskProvider.propTypes = { children: PropTypes.node.isRequired }
