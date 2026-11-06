import PropTypes from "prop-types"
import { useContext, useState } from "react"
import { House, ListChecks, ChevronLeft, ChevronRight, X, Check, Plus, Sprout } from "lucide-react"
import { Link } from "react-router-dom"
import { TaskContext } from "../../contexts/TaskContext"
import SidebarButton from "./SidebarButton"

const Sidebar = ({ mobile = false, onClose, onNavigate }) => {
  // Compartilha os tópicos e contadores com a página de tarefas.
  const { tarefas, topicos } = useContext(TaskContext)
  const [desktopRecolhida, setRecolhida] = useState(false)
  const recolhida = !mobile && desktopRecolhida
  const navigationId = mobile ? "mobile-navigation" : "sidebar-navigation"
  const ToggleIcon = mobile ? X : recolhida ? ChevronRight : ChevronLeft

  return (
    <aside
      aria-label="Menu lateral"
      className={`flex h-dvh shrink-0 flex-col border-r border-stone-300 bg-[#e4d9cc] transition-[width] duration-200 motion-reduce:transition-none ${
        mobile ? "w-full" : recolhida ? "w-20" : "w-56"
      }`}
    >
      <header className="flex h-28 shrink-0 flex-col gap-3 px-4 pt-5">
        <div className="flex h-12 items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-white"
          >
            <Check size={22} />
          </span>
          {!recolhida && (
            <span className="whitespace-nowrap text-sm font-semibold text-stone-800">
              Task Manager
            </span>
          )}
        </div>

      </header>

      {!recolhida && <p className="px-6 pb-2 text-[9px] uppercase text-muted">Meu espaço</p>}
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
        <div className="mb-3 flex items-center justify-between text-[9px] uppercase text-muted">Tópicos<Link to="/tasks" onClick={onNavigate} aria-label="Ir para tópicos" className="rounded p-1 hover:bg-stone-200"><Plus size={14} /></Link></div>
        {topicos.map((topico) => <Link key={topico.id} to={`/tasks#topic-${topico.id}`} onClick={onNavigate} className="flex items-center gap-3 rounded-lg py-2 text-xs text-muted hover:text-primary"><span className="size-1.5 rounded-full bg-primary" /><span className="min-w-0 flex-1 break-words">{topico.nome}</span><span>{tarefas.filter((tarefa) => tarefa.topicoId === topico.id).length}</span></Link>)}
      </section>}
      {/* Mantém a mensagem e o controle do menu no rodapé. */}
      <div className="mt-auto px-5 pb-5">
        {!recolhida && <div className="mb-12 text-xs leading-5 text-muted"><Sprout size={20} className="mb-3 text-primary" /><p>Um passo de cada vez.<br />Seu ritmo também importa.</p></div>}
        <button type="button" onClick={mobile ? onClose : () => setRecolhida((atual) => !atual)} aria-label={mobile ? "Fechar menu" : recolhida ? "Expandir menu" : "Recolher menu"} aria-expanded={mobile ? undefined : !recolhida} aria-controls={navigationId} className="flex w-full items-center gap-2 border-t border-stone-300 pt-4 text-xs text-muted"><ToggleIcon size={16} />{!recolhida && (mobile ? "Fechar menu" : "Recolher menu")}</button>
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
