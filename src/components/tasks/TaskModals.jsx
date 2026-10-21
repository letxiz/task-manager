import PropTypes from "prop-types"
import ConfirmDialog from "../ui/ConfirmDialog"
import DetailsModal from "./DetailsModal"
import TaskFormModal from "./TaskFormModal"
import TaskTopicModal from "./TaskTopicModal"

export default function TaskModals({ dialogos, formularioTarefa, formularioTopico }) {
  return (
    <>
      <ConfirmDialog {...dialogos.exclusaoTopico} />
      <ConfirmDialog {...dialogos.limpeza} />
      <DetailsModal {...dialogos.detalhes} />
      <TaskFormModal {...formularioTarefa.props} />
      <TaskTopicModal {...formularioTopico.props} />
    </>
  )
}

TaskModals.propTypes = {
  dialogos: PropTypes.object.isRequired,
  formularioTarefa: PropTypes.object.isRequired,
  formularioTopico: PropTypes.object.isRequired,
}
