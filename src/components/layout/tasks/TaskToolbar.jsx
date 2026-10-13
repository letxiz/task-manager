import PropTypes from "prop-types"
import { Plus, Trash2 } from "lucide-react"

function TaskToolbar({ taskCount, onClear, onCreate }) {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
      <span className="text-lg font-bold text-slate-700">
        Minhas Tarefas {taskCount}
      </span>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onClear}
          disabled={taskCount === 0}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-500 transition-colors hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Limpar tarefas
          <Trash2 size={18} />
        </button>

        <button
          type="button"
          onClick={onCreate}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
        >
          Nova tarefa
          <Plus size={18} />
        </button>
      </div>
    </div>
  )
}

TaskToolbar.propTypes = {
  taskCount: PropTypes.number.isRequired,
  onClear: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
}

export default TaskToolbar
