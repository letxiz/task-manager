import PropTypes from "prop-types"
import { Trash2 } from "lucide-react"

function TaskItem({ task, onToggle, onDelete }) {
  return (
    <li className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <input
        type="checkbox"
        checked={task.concluida}
        onChange={() => onToggle(task.id)}
        aria-label={`Concluir ${task.titulo}`}
        className="mt-1 size-4 cursor-pointer accent-red-700"
      />

      <div className="min-w-0 flex-1">
        <h2
          className={`font-semibold ${
            task.concluida ? "text-slate-400 line-through" : "text-slate-800"
          }`}
        >
          {task.titulo}
        </h2>

        {task.descricao && (
          <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-600">
            {task.descricao}
          </p>
        )}

        {task.data && (
          <p className="mt-2 text-xs text-slate-500">
            Prazo: {" "}
            {new Date(`${task.data}T00:00:00`).toLocaleDateString("pt-BR")}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => onDelete(task.id)}
        aria-label={`Excluir ${task.titulo}`}
        title="Excluir tarefa"
        className="cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 size={18} />
      </button>
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
  onToggle: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
}

export default TaskItem
