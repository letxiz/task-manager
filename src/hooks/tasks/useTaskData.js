import { useContext } from "react"
import { TaskContext } from "../../contexts/TaskContext"

export function useTaskData() {
  const dados = useContext(TaskContext)
  if (!dados) throw new Error("useTaskData requer TaskProvider")
  return dados
}
