import PropTypes from "prop-types"
import { useContext, useState } from "react"
import { House, ListChecks, Check, Sprout } from "lucide-react"
import { Link } from "react-router-dom"
import { TaskContext } from "../../contexts/TaskContext"
import SidebarButton from "./SidebarButton"

const Sidebar = ({ mobile = false, onClose, onNavigate }) => {
  // Compartilha os tópicos e contadores com a página de tarefas.
  const { tarefas, topicos } = useContext(TaskContext)
  const [desktopRecolhida, setRecolhida] = useState(false)
  const recolhida = !mobile && desktopRecolhida
  const navigationId = mobile ? "mobile-navigation" : "sidebar-navigation"

  return (
    <aside
      aria-label="Menu lateral"
      className={`flex h-dvh shrink-0 flex-col border-r border-stone-300 bg-[#e4d9cc] transition-[width] duration-200 motion-reduce:transition-none ${
        mobile ? "w-full" : recolhida ? "w-20" : "w-64"
      }`}
    >
      <header className="flex h-28 shrink-0 flex-col gap-3 px-4 pt-5">
        <div className="flex h-12 items-center gap-3">
          {/* O ícone também controla a abertura do menu lateral. */}
          <button
            type="button"
            onClick={mobile ? onClose : () => setRecolhida((atual) => !atual)}
            aria-label={mobile ? "Fechar menu" : recolhida ? "Expandir menu" : "Recolher menu"}
            aria-expanded={mobile ? true : !recolhida}
            aria-controls={navigationId}
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-primary text-white hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Check size={22} aria-hidden="true" />
          </button>
          {!recolhida && (
            <span className="whitespace-nowrap text-base font-semibold text-stone-800">
              Task Manager
            </span>
          )}
        </div>

      </header>

      {/* Aumenta os rótulos para facilitar a leitura do menu. */}
      {!recolhida && <p className="px-6 pb-2 text-xs font-medium uppercase text-muted">Meu espaço</p>}
      <nav
        id={navigationId}
        aria-label="Navegação principal"
        className="flex flex-col gap-2 px-3 pb-4"
      >
        <SidebarButton to="/" label="Início" recolhida={recolhida} onClick={onNavigate}>
          <House size={18} className="shrink-0" aria-hidden="true" />
        </SidebarButton>
        <SidebarButton to="/tasks" label="Minhas Tarefas" recolhida={recolhida} onClick={onNavigate}>
          <ListChecks size={18} className="shrink-0" aria-hidden="true" />
        </SidebarButton>
      </nav>
      {/* Lista os tópicos cadastrados no menu lateral. */}
      {!recolhida && <section className="mt-3 px-5">
        <div className="mb-3 flex items-center justify-between text-xs font-medium uppercase text-muted">Tópicos</div>
        {topicos.map((topico) => <Link key={topico.id} to={`/tasks#topic-${topico.id}`} onClick={onNavigate} className="flex items-center gap-3 rounded-lg py-2 text-sm text-muted hover:text-primary"><span className="size-1.5 rounded-full bg-primary" /><span className="min-w-0 flex-1 break-words">{topico.nome}</span><span className="inline-flex min-h-7 min-w-7 shrink-0 items-center justify-center rounded-md bg-white/60 px-2 text-base font-semibold leading-none tabular-nums text-stone-800">{tarefas.filter((tarefa) => tarefa.topicoId === topico.id).length}</span></Link>)}
      </section>}
      {/* Mantém a mensagem no rodapé do menu. */}
      <div className="mt-auto px-5 pb-5">
        {!recolhida && <div className="mb-12 text-sm leading-6 text-muted"><Sprout size={20} className="mb-3 text-primary" /><p>Um passo de cada vez.<br />Seu ritmo também importa.</p></div>}
      </div>
    </aside>
  )
}

Sidebar.propTypes = {
  mobile: PropTypes.bool,
  onClose: PropTypes.func,
  onNavigate: PropTypes.func,
}

export default Sidebar
