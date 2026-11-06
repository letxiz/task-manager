import PropTypes from "prop-types"
import { FolderPlus, Plus } from "lucide-react"

export default function TaskToolbar({ onCreateTask, onCreateTopic }) {
  return <>
    {/* Ações de criação sempre visíveis no cabeçalho. */}
    <header className="flex flex-wrap items-center justify-between gap-5">
      <div><h1 className="text-3xl font-semibold tracking-tight">Minhas Tarefas</h1><p className="mt-2 text-base text-muted">Organize aqui o que precisa fazer.</p></div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onCreateTopic} aria-haspopup="dialog" className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-3 text-base font-medium cursor-pointer transition-[background-color,border-color,box-shadow] duration-150 hover:border-primary hover:bg-primary/10 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none"><FolderPlus size={16} aria-hidden="true" />Novo tópico</button>
        <button type="button" onClick={onCreateTask} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-3 text-base font-medium text-white cursor-pointer transition-[background-color,box-shadow] duration-150 hover:bg-primary-hover hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none"><Plus size={16} />Nova tarefa</button>
      </div>
    </header>
  </>
}
TaskToolbar.propTypes = {
  onCreateTask: PropTypes.func.isRequired,
  onCreateTopic: PropTypes.func.isRequired,
}
