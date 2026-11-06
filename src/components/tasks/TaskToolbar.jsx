import PropTypes from "prop-types"
import { FolderPlus, Plus, Trash2 } from "lucide-react"

export default function TaskToolbar({ taskCount, completedCount, hasItems, onClear, onCreateTask, onCreateTopic }) {
  return <>
    {/* Ações de criação sempre visíveis no cabeçalho. */}
    <header className="flex flex-wrap items-center justify-between gap-5">
      <div><h1 className="text-3xl font-semibold tracking-tight">Minhas Tarefas</h1><p className="mt-2 text-sm text-muted">Organize aqui o que precisa fazer.</p></div>
      <div className="flex gap-2">
        <button type="button" onClick={onCreateTopic} className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm font-medium hover:bg-stone-50"><FolderPlus size={16} />Novo tópico</button>
        <button type="button" onClick={onCreateTask} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-white hover:bg-primary-hover"><Plus size={16} />Nova tarefa</button>
      </div>
    </header>
    {/* Resume o total, as pendências e as conclusões. */}
    <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-b border-stone-300 pb-7">
      <div className="flex items-center divide-x divide-stone-200 text-xs text-muted">
        {[[taskCount, taskCount === 1 ? "tarefa" : "tarefas"], [taskCount - completedCount, taskCount - completedCount === 1 ? "pendente" : "pendentes"], [completedCount, "concluídas"]].map(([count, label]) => <span key={label} className="px-5 first:pl-0"><strong className="mr-2 text-2xl font-semibold text-stone-700">{count}</strong>{label}</span>)}
      </div>
      <button type="button" onClick={onClear} disabled={!hasItems} className="inline-flex items-center gap-2 rounded-lg p-2 text-sm text-danger disabled:opacity-40"><Trash2 size={16} />Limpar tudo</button>
    </div>
  </>
}
TaskToolbar.propTypes = {
  taskCount: PropTypes.number.isRequired, completedCount: PropTypes.number.isRequired,
  hasItems: PropTypes.bool.isRequired, onClear: PropTypes.func.isRequired,
  onCreateTask: PropTypes.func.isRequired, onCreateTopic: PropTypes.func.isRequired,
}
