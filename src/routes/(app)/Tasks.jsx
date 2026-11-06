import { useState } from "react"
import { Search, X, GripVertical, Trash2 } from "lucide-react"
import TaskList from "../../components/tasks/list/TaskList"
import TaskModals from "../../components/tasks/modals/TaskModals"
import TaskToolbar from "../../components/tasks/TaskToolbar"
import { useTaskData } from "../../hooks/tasks/useTaskData"
import { useTaskDialogs } from "../../hooks/tasks/useTaskDialogs"
import { useTaskForm } from "../../hooks/tasks/useTaskForm"
import { useTopicForm } from "../../hooks/tasks/useTopicForm"

function Tasks() {
  // Guarda o status selecionado e o texto da busca.
  const [filtro, setFiltro] = useState("todas")
  const [busca, setBusca] = useState("")
  const dados = useTaskData()
  const formularioTarefa = useTaskForm(dados)
  const formularioTopico = useTopicForm(dados)
  const dialogos = useTaskDialogs(dados, formularioTarefa, formularioTopico)
  const { tarefas, topicos, erroArmazenamento } = dados

  const concluidas = tarefas.filter((tarefa) => tarefa.concluida).length
  // Combina o filtro de status com a busca por título e descrição.
  const visiveis = tarefas.filter((tarefa) => (filtro === "todas" || (filtro === "concluidas" ? tarefa.concluida : !tarefa.concluida)) && `${tarefa.titulo} ${tarefa.descricao ?? ""}`.toLocaleLowerCase("pt-BR").includes(busca.trim().toLocaleLowerCase("pt-BR")))

  return (
    <div className="flex min-h-[calc(100dvh-190px)] flex-col">
      {erroArmazenamento && (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-base text-red-800">
          {erroArmazenamento}
        </p>
      )}

      <TaskToolbar
        onCreateTask={formularioTarefa.abrir}
        onCreateTopic={formularioTopico.abrir}
      />
      <div className="my-7 flex flex-col gap-5 rounded-2xl border border-stone-200 bg-white p-4 sm:p-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">Filtrar por status</p>
          <div role="group" aria-label="Filtrar tarefas por status" className="flex flex-wrap gap-2">
            {[["todas", "Todas", tarefas.length], ["pendentes", "Pendentes", tarefas.length - concluidas], ["concluidas", "Concluídas", concluidas]].map(([value, label, count]) => <button key={value} type="button" aria-pressed={filtro === value} onClick={() => setFiltro(value)} className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${filtro === value ? "border-primary bg-primary font-medium text-white" : "border-stone-200 bg-white text-muted hover:border-primary/40 hover:bg-stone-50"}`}>{label}<span className={`rounded-md px-1.5 py-0.5 text-xs tabular-nums ${filtro === value ? "bg-white/20 text-white" : "bg-stone-100 text-stone-600"}`}>{count}</span></button>)}
          </div>
        </div>
        <div className="w-full lg:max-w-xs">
          <label htmlFor="task-search" className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted">Buscar tarefa</label>
          <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-muted transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
            <Search size={18} aria-hidden="true" className="shrink-0" />
            <input id="task-search" type="search" placeholder="Título ou descrição…" value={busca} onChange={(event) => setBusca(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none [&::-webkit-search-cancel-button]:appearance-none" />
            {busca && <button type="button" onClick={() => setBusca("")} aria-label="Limpar busca" className="cursor-pointer rounded p-1 hover:bg-stone-200 focus-visible:outline-2 focus-visible:outline-primary"><X size={14} /></button>}
          </div>
        </div>
      </div>
      <TaskList
        tarefasVisiveis={visiveis}
        filtrando={Boolean(busca.trim()) || filtro !== "todas"}
        tarefas={tarefas}
        topicos={topicos}
        onToggle={dados.alternarConclusao}
        onDelete={dados.excluirTarefa}
        onEditTask={dialogos.verTarefa}
        onEditTopic={dialogos.verTopico}
        onEditUnassigned={formularioTopico.editarSemTopico}
        onMoveTask={dados.moverTarefa}
        onReorderTasks={dados.reordenarTarefas}
        onReorderTopicos={dados.setTopicos}
        onDeleteTopic={dialogos.solicitarExclusaoTopico}
      />
      {topicos.length > 0 && <p className="mt-7 flex items-center gap-2 text-sm text-muted"><GripVertical size={12} />Arraste os tópicos para organizar do seu jeito.</p>}
      {/* Mostra o resumo e o progresso no fim da página. */}
      <footer className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-16 text-sm text-muted">
        <button type="button" onClick={dialogos.limpar} disabled={tarefas.length === 0 && topicos.length === 0} className="inline-flex items-center gap-2 rounded-lg p-2 text-muted enabled:cursor-pointer enabled:hover:bg-red-50 enabled:hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger disabled:opacity-40"><Trash2 size={16} aria-hidden="true" />Limpar tudo</button>
        <span className="flex items-center gap-3">{concluidas} de {tarefas.length} concluída{tarefas.length === 1 ? "" : "s"}<progress aria-label="Progresso das tarefas" value={concluidas} max={tarefas.length || 1} className="task-progress h-1 w-24" /></span>
      </footer>
      <TaskModals
        dialogos={dialogos}
        formularioTarefa={formularioTarefa}
        formularioTopico={formularioTopico}
      />
    </div>
  )
}

export default Tasks
