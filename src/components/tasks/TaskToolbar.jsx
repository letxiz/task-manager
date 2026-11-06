import PropTypes from "prop-types"
import { FolderPlus, Plus, Trash2 } from "lucide-react"

export default function TaskToolbar({ taskCount, completedCount, hasItems, onClear, onCreateTask, onCreateTopic }) {
  return <>
    {/* Ações de criação sempre visíveis no cabeçalho. */}
    <header className="flex flex-wrap items-center justify-between gap-5">
      <div><h1 className="text-3xl font-semibold tracking-tight">Minhas Tarefas</h1><p className="mt-2 text-base text-muted">Organize aqui o que precisa fazer.</p></div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onCreateTopic} aria-haspopup="dialog" className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-3 text-base font-medium cursor-pointer transition-[background-color,border-color,box-shadow] duration-150 hover:border-primary hover:bg-primary/10 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none"><FolderPlus size={16} aria-hidden="true" />Novo tópico</button>
        <button type="button" onClick={onCreateTask} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-3 text-base font-medium text-white cursor-pointer transition-[background-color,box-shadow] duration-150 hover:bg-primary-hover hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none"><Plus size={16} />Nova tarefa</button>
      </div>
    </header>
    {/* Resume o total, as pendências e as conclusões. */}
    <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-b border-stone-300 pb-7">
      <div className="flex items-center divide-x divide-stone-200 text-sm text-muted">
        {[[taskCount, taskCount === 1 ? "tarefa" : "tarefas"], [taskCount - completedCount, taskCount - completedCount === 1 ? "pendente" : "pendentes"], [completedCount, "concluídas"]].map(([count, label]) => <span key={label} className="px-5 first:pl-0"><strong className="mr-2 text-2xl font-semibold text-stone-700">{count}</strong>{label}</span>)}
      </div>
      <button type="button" onClick={onClear} disabled={!hasItems} className="inline-flex items-center gap-2 rounded-lg p-2 text-base text-danger transition-[background-color,box-shadow] duration-150 enabled:cursor-pointer enabled:hover:bg-red-100 enabled:hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"><Trash2 size={16} />Limpar tudo</button>
    </div>
  </>
}
TaskToolbar.propTypes = {
  taskCount: PropTypes.number.isRequired, completedCount: PropTypes.number.isRequired,
  hasItems: PropTypes.bool.isRequired, onClear: PropTypes.func.isRequired,
  onCreateTask: PropTypes.func.isRequired,
  onCreateTopic: PropTypes.func.isRequired,
}
