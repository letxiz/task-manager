import PropTypes from "prop-types"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { getTopicColor } from "../../../constants/topicColors"
import TaskItem from "./TaskItem"

export default function TaskGroup({ tarefas, topicId, topicColor, onToggle, onDelete, onEdit }) {
  if (tarefas.length === 0) {
    return <p className={`border-l-4 px-6 py-8 text-base text-muted ${getTopicColor(topicColor).accent}`}>Nenhuma tarefa neste tópico.</p>
  }

  return (
    <SortableContext items={tarefas.map((tarefa) => `task:${tarefa.id}`)} strategy={verticalListSortingStrategy}>
      {/* Separa as tarefas por linhas dentro do grupo. */}
      <ul className={`divide-y divide-stone-100 ${topicId ? `border-l-4 ${getTopicColor(topicColor).accent}` : ""}`}>
        {tarefas.map((tarefa) => (
          <TaskItem key={tarefa.id} task={tarefa} topicId={topicId} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} />
        ))}
      </ul>
    </SortableContext>
  )
}

TaskGroup.propTypes = {
  tarefas: PropTypes.arrayOf(TaskItem.propTypes.task).isRequired,
  topicId: PropTypes.string.isRequired,
  topicColor: PropTypes.string,
  onToggle: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
}
