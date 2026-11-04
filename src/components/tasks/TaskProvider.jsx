import PropTypes from "prop-types"
import { TaskContext } from "../../contexts/TaskContext"
import { useTaskStore } from "../../hooks/tasks/useTaskStore"

export default function TaskProvider({ children }) {
  // Uma única lista para todas as páginas.
  const dados = useTaskStore()
  return <TaskContext.Provider value={dados}>{children}</TaskContext.Provider>
}

TaskProvider.propTypes = { children: PropTypes.node.isRequired }
