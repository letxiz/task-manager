import PropTypes from "prop-types"
import { Check, Trash2 } from "lucide-react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import Tooltip, { useTooltip } from "./Tooltip"

function TaskItem({ task, topicId, onToggle, onDelete }) {
  const completionTooltip = useTooltip()
  const deleteTooltip = useTooltip()
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
      {...attributes}
      {...listeners}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2 gap-y-1 rounded-xl bg-orange-100 px-2 py-1 ${
        isDragging ? "cursor-grabbing opacity-50" : "cursor-grab"
      }`}
    >
      <Tooltip
        id={completionTooltip.id}
        open={completionTooltip.open}
        wrapperProps={completionTooltip.wrapperProps}
        content={task.concluida ? "Desmarcar tarefa" : "Concluir tarefa"}
        className="col-start-1 row-start-1"
      >
        <label className="inline-flex size-5 cursor-pointer items-center justify-center rounded-sm">
          <input
            {...completionTooltip.triggerProps}
            type="checkbox"
            checked={task.concluida}
            onChange={() => onToggle(task.id)}
            aria-label={`Concluir ${task.titulo}`}
            className="sr-only"
          />
          <span
            aria-hidden="true"
            className={`flex size-5 items-center justify-center rounded-sm bg-orange-300 ${
              task.concluida ? "text-white" : "text-transparent"
            }`}
          >
            {task.concluida && <Check size={14} strokeWidth={3} />}
          </span>
        </label>
      </Tooltip>

      <h2
        className={`col-start-2 row-start-1 flex min-h-6 min-w-0 text-sm items-center font-semibold ${
          task.concluida ? "text-slate-400 line-through" : "text-slate-700"
        }`}
      >
        {task.titulo}
      </h2>

      {task.descricao && (
        <p className="col-start-2 mt-1 whitespace-pre-wrap break-words text-sm text-slate-600">
          {task.descricao}
        </p>
      )}

      {task.data && (
        <p className="col-start-2 mt-1 text-xs text-slate-500">
          Prazo: {" "}
          {new Date(`${task.data}T00:00:00`).toLocaleDateString("pt-BR")}
        </p>
      )}

      <Tooltip
        id={deleteTooltip.id}
        open={deleteTooltip.open}
        wrapperProps={deleteTooltip.wrapperProps}
        content="Excluir tarefa"
        className="col-start-3 row-start-1"
      >
        <button
          {...deleteTooltip.triggerProps}
          type="button"
          onClick={(event) => {
            deleteTooltip.triggerProps.onClick(event)
            onDelete(task.id)
          }}
          aria-label={`Excluir ${task.titulo}`}
          className="cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:text-red-600"
        >
          <Trash2 size={18} />
        </button>
      </Tooltip>
    </li>
  )
}

TaskItem.propTypes = {
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
