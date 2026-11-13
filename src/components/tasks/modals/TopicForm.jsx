import { memo, useImperativeHandle } from "react"
import PropTypes from "prop-types"
import { useTaskActions } from "../../../hooks/tasks/useTaskData"
import { useTopicForm } from "../../../hooks/tasks/useTopicForm"
import TaskTopicModal from "./TaskTopicModal"

function TopicForm({ ref }) {
  const acoes = useTaskActions()
  const formulario = useTopicForm(acoes)
  useImperativeHandle(ref, () => ({
    abrir: formulario.abrir,
    editar: formulario.editar,
    editarSemTopico: formulario.editarSemTopico,
  }))
  return <TaskTopicModal {...formulario.props} />
}

TopicForm.propTypes = { ref: PropTypes.object.isRequired }

export default memo(TopicForm)
