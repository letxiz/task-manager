import TaskStatusBadge from "../TaskStatusBadge"
import PropTypes from "prop-types"
import { CalendarDays, Check } from "lucide-react"
import ItemActions from "../controls/ItemActions"
import { formatarDataExibicao } from "../../../utils/dateUtils"

export default function TaskItemContent({
  task,
  onToggle,
  onDelete,
  onEdit,
  preview = false,
}) {
  // Organiza a linha com conclusão, descrição, prazo, status e ações.
  return (
    <>
      <label className="flex size-5 cursor-pointer items-center justify-center">
        <input
          type="checkbox"
          checked={task.concluida}
          disabled={preview}
          onChange={() => onToggle?.(task.id)}
          aria-label={`${task.concluida ? "Reabrir" : "Concluir"} ${task.titulo}`}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className={`flex size-5 items-center justify-center rounded-md border peer-focus-visible:outline-2 peer-focus-visible:outline-primary ${task.concluida ? "border-primary bg-primary text-white" : "border-stone-400 bg-white"}`}
        >
          {task.concluida && <Check size={14} />}
        </span>
      </label>
      <div className="min-w-0">
        <button
          type="button"
          disabled={preview}
          onClick={() => onEdit?.(task)}
          className={`max-w-full [overflow-wrap:anywhere] text-left text-base font-medium hover:underline ${task.concluida ? "text-muted line-through" : "text-stone-800"}`}
          aria-label={`Ver detalhes da tarefa ${task.titulo}`}
        >
          {task.titulo}
        </button>
        {task.descricao && (
          <p className="mt-1 whitespace-pre-wrap [overflow-wrap:anywhere] text-sm text-muted">
            {task.descricao}
          </p>
        )}
      </div>
      <div className="col-start-2 text-sm text-muted sm:col-auto">
        <span className="block text-sm">Prazo</span>
        <span className="mt-1 inline-flex items-center gap-1">
          <CalendarDays size={12} />
          {task.data ? formatarDataExibicao(task.data) : "Sem prazo"}
        </span>
      </div>
      <TaskStatusBadge
        completed={task.concluida}
        className="col-start-2 w-fit sm:col-auto"
      />
      <div className="col-start-3 row-start-1 flex items-center gap-1 sm:col-auto sm:row-auto">
        <ItemActions
          name={task.titulo}
          disabled={preview}
          onEdit={() => onEdit?.(task, true)}
          onDelete={() => onDelete?.(task.id)}
        />
      </div>
    </>
  )
}
TaskItemContent.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.string.isRequired,
    titulo: PropTypes.string.isRequired,
    descricao: PropTypes.string,
    data: PropTypes.string,
    concluida: PropTypes.bool,
  }).isRequired,
  onToggle: PropTypes.func,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
  preview: PropTypes.bool,
}
