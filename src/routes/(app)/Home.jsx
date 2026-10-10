import { ArrowRight, ListChecks } from "lucide-react"
import { Link } from "react-router-dom"

function Home() {
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Início</h1>
      <p className="mt-2 text-slate-600">Um espaço para organizar suas tarefas e planejar seu dia.</p>

      <section aria-labelledby="welcome-title" className="mt-8 rounded-2xl border border-orange-200 bg-white p-6 sm:p-8">
        <ListChecks size={32} aria-hidden="true" className="text-red-700" />
        <h2 id="welcome-title" className="mt-4 text-xl font-semibold">Suas tarefas em um só lugar</h2>
        <p className="mt-2 max-w-xl leading-7 text-slate-600">
          Acesse sua lista de tarefas pelo menu ou pelo atalho abaixo.
        </p>
        <Link to="/tasks" className="mt-6 inline-flex min-h-12 items-center gap-3 rounded-xl bg-red-200 px-4 py-3 font-medium text-red-900 transition-colors hover:bg-red-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 motion-reduce:transition-none">
          Minhas Tarefas <ArrowRight size={20} aria-hidden="true" />
        </Link>
      </section>
    </>
  )
}

export default Home
