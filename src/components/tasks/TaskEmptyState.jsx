import { ListChecks } from "lucide-react"

function TaskEmptyState() {
  return (
    // Apresentado quando ainda não existem tarefas nem tópicos para listar.
    <section
      aria-labelledby="tasks-empty-title"
      className="mt-6 rounded-2xl border border-dashed border-orange-300 bg-white px-6 py-12 text-center"
    >
      <ListChecks size={40} aria-hidden="true" className="mx-auto text-red-700" />

      <h2 id="tasks-empty-title" className="mt-4 text-lg font-semibold">
        Sua lista está vazia
      </h2>

      <p className="mx-auto mt-2 max-w-md leading-7 text-slate-600">
        Comece adicionando sua primeira tarefa.
      </p>
    </section>
  )
}

export default TaskEmptyState
