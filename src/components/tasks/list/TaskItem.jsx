import PropTypes from "prop-types"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import TaskItemContent from "./TaskItemContent"
import { taskCardClassName } from "../../../constants/taskStyles"

function TaskItem({ task, topicId, onToggle, onDelete, onEdit }) {
  // Identifica a tarefa no arraste.
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: `task:${task.id}`,
    data: { kind: "task", taskId: task.id, topicId },
  })

  return (
    <li
      ref={setNodeRef}
      // Ignora cliques nos controles.
      onClick={(event) => {
        if (!isDragging && !event.target.closest("button, input, label")) onEdit(task)
      }}
      {...attributes}
      {...listeners}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`${taskCardClassName} ${
        isDragging ? "cursor-grabbing opacity-30" : "cursor-grab"
      }`}
    >
      <TaskItemContent task={task} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} />
    </li>
  )
}

TaskItem.propTypes = {
  onEdit: PropTypes.func.isRequired,
  task: PropTypes.shape({
    id: PropTypes.string.isRequired,
    titulo: PropTypes.string.isRequired,
    descricao: PropTypes.string,
    data: PropTypes.string,
    concluida: PropTypes.bool,
  }).isRequired,
  topicId: PropTypes.string.isRequired,
  onToggle: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
}


export default TaskItem
