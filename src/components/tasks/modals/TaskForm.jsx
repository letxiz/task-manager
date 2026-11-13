import { useImperativeHandle } from "react"
import PropTypes from "prop-types"
import { useTaskForm } from "../../../hooks/tasks/useTaskForm"
import TaskFormModal from "./TaskFormModal"

export default function TaskForm({ ref, dados }) {
  const formulario = useTaskForm(dados)
  useImperativeHandle(ref, () => ({
    abrir: formulario.abrir,
    editar: formulario.editar,
    removerTopico: formulario.removerTopico,
  }))
  return <TaskFormModal {...formulario.props} />
}

TaskForm.propTypes = { ref: PropTypes.object.isRequired, dados: PropTypes.object.isRequired }
