import PropTypes from "prop-types"
import ConfirmDialog from "../../ui/ConfirmDialog"
import DetailsModal from "./DetailsModal"
import TaskForm from "./TaskForm"
import TopicForm from "./TopicForm"

export default function TaskModals({ dados, dialogos, tarefaRef, topicoRef }) {
  return (
    <>
      <ConfirmDialog {...dialogos.exclusaoTopico} />
      <ConfirmDialog {...dialogos.limpeza} />
      <DetailsModal {...dialogos.detalhes} />
      <TaskForm ref={tarefaRef} dados={dados} />
      <TopicForm ref={topicoRef} />
    </>
  )
}

TaskModals.propTypes = {
  dados: PropTypes.object.isRequired,
  dialogos: PropTypes.object.isRequired,
  tarefaRef: PropTypes.object.isRequired,
  topicoRef: PropTypes.object.isRequired,
}
