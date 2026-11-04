import PropTypes from "prop-types"
import { Plus } from "lucide-react"

export default function HomeHeader({ onCreate }) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Início</h1>
        <p className="mt-2 text-sm text-muted">Um olhar para o seu dia. Uma tarefa de cada vez.</p>
      </div>
      <button type="button" onClick={onCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-white hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
        <Plus size={18} aria-hidden="true" />Nova tarefa
      </button>
    </header>
  )
}

HomeHeader.propTypes = { onCreate: PropTypes.func.isRequired }
