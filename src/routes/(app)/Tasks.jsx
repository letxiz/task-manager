import { ListChecks } from "lucide-react"

function Tasks() {
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Minhas Tarefas</h1>
      <p className="mt-2 text-slate-600">Organize aqui o que precisa fazer.</p>

      <section aria-labelledby="tasks-empty-title" className="mt-8 rounded-2xl border border-dashed border-orange-300 bg-white px-6 py-12 text-center">
        <ListChecks size={40} aria-hidden="true" className="mx-auto text-red-700" />
        <h2 id="tasks-empty-title" className="mt-4 text-lg font-semibold">Sua lista de tarefas aparecerá aqui</h2>
        <p className="mx-auto mt-2 max-w-md leading-7 text-slate-600">
          A criação e o gerenciamento de tarefas ainda estão em desenvolvimento.
        </p>
      </section>
    </>
  )
}

export default Tasks
