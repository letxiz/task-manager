import TaskList from "../../components/tasks/TaskList"
import TaskModals from "../../components/tasks/TaskModals"
import TaskToolbar from "../../components/tasks/TaskToolbar"
import { useTaskData } from "../../hooks/tasks/useTaskData"
import { useTaskDialogs } from "../../hooks/tasks/useTaskDialogs"
import { useTaskForm } from "../../hooks/tasks/useTaskForm"
import { useTopicForm } from "../../hooks/tasks/useTopicForm"

function Tasks() {
  const dados = useTaskData()
  const formularioTarefa = useTaskForm(dados)
  const formularioTopico = useTopicForm(dados)
  const dialogos = useTaskDialogs(dados, formularioTarefa, formularioTopico)
  const { tarefas, topicos, erroArmazenamento } = dados

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Minhas Tarefas
      </h1>
      <p className="mt-2 text-slate-600">Organize aqui o que precisa fazer.</p>

      {erroArmazenamento && (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-800">
          {erroArmazenamento}
        </p>
      )}

      <TaskToolbar
        taskCount={tarefas.length}
        hasItems={tarefas.length > 0 || topicos.length > 0}
        onClear={dialogos.limpar}
        onCreateTask={formularioTarefa.abrir}
        onCreateTopic={formularioTopico.abrir}
      />
      <TaskList
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
      <TaskModals
        dialogos={dialogos}
        formularioTarefa={formularioTarefa}
        formularioTopico={formularioTopico}
      />
    </>
  )
}

export default Tasks
