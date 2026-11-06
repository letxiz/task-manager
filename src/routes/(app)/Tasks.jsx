import { useState } from "react"
import { Search, GripVertical } from "lucide-react"
import TaskList from "../../components/tasks/TaskList"
import TaskModals from "../../components/tasks/TaskModals"
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
        <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-800">
          {erroArmazenamento}
        </p>
      )}

      <TaskToolbar
        taskCount={tarefas.length}
        completedCount={concluidas}
        hasItems={tarefas.length > 0 || topicos.length > 0}
        onClear={dialogos.limpar}
        onCreateTask={formularioTarefa.abrir}
        onCreateTopic={formularioTopico.abrir}
      />
      {/* Filtros e busca atualizam a lista sem alterar os dados salvos. */}
      <div className="my-8 flex flex-wrap items-center justify-between gap-4">
        <div role="group" aria-label="Filtrar tarefas por status" className="flex rounded-lg bg-[#e0d5c9] p-1 text-xs">
          {[["todas", "Todas", tarefas.length], ["pendentes", "Pendentes", tarefas.length - concluidas], ["concluidas", "Concluídas", concluidas]].map(([value, label, count]) => <button key={value} type="button" aria-pressed={filtro === value} onClick={() => setFiltro(value)} className={`rounded-md px-4 py-2 ${filtro === value ? "bg-white font-medium text-stone-800 shadow-sm" : "text-muted"}`}>{label}<span className="ml-2 text-primary">{count}</span></button>)}
        </div>
        <label className="flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-2 text-muted"><Search size={16} /><input aria-label="Buscar tarefas" placeholder="Buscar tarefas..." value={busca} onChange={(event) => setBusca(event.target.value)} className="w-48 bg-transparent text-xs outline-none focus-visible:ring-2 focus-visible:ring-primary" /></label>
      </div>
      <TaskList
        tarefasVisiveis={visiveis}
        filtrando={Boolean(busca.trim()) || filtro !== "todas"}
        onCreateTask={(id) => formularioTarefa.abrir(id)}
        tarefas={tarefas}
        topicos={topicos}
        onToggle={dados.alternarConclusao}
        onDelete={dados.excluirTarefa}
        onEditTask={dialogos.verTarefa}
        onEditTopic={dialogos.verTopico}
        onMoveTask={dados.moverTarefa}
        onReorderTasks={dados.reordenarTarefas}
        onReorderTopicos={dados.setTopicos}
        onDeleteTopic={dialogos.solicitarExclusaoTopico}
      />
      {topicos.length > 0 && <p className="mt-7 flex items-center gap-2 text-xs text-muted"><GripVertical size={12} />Arraste os tópicos para organizar do seu jeito.</p>}
      {/* Mostra o resumo e o progresso no fim da página. */}
      <footer className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-16 text-xs text-muted">
        <span>{tarefas.length} {tarefas.length === 1 ? "tarefa" : "tarefas"} em {topicos.length} {topicos.length === 1 ? "tópico" : "tópicos"}</span>
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
