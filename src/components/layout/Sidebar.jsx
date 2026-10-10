import PropTypes from "prop-types"
import { useState } from "react"
import { House, ListChecks, ChevronLeft, ChevronRight, X } from "lucide-react"
import SidebarButton from "./SidebarButton"

const Sidebar = ({ mobile = false, onClose, onNavigate }) => {
  const [desktopRecolhida, setRecolhida] = useState(false)
  const recolhida = !mobile && desktopRecolhida
  const navigationId = mobile ? "mobile-navigation" : "sidebar-navigation"
  const ToggleIcon = mobile ? X : recolhida ? ChevronRight : ChevronLeft

  return (
    <aside
      aria-label="Menu lateral"
      className={`flex h-dvh shrink-0 flex-col border-r border-orange-200 bg-orange-100 transition-[width] duration-200 motion-reduce:transition-none ${
        mobile ? "w-full" : recolhida ? "w-20" : "w-72"
      }`}
    >
      <header className="flex h-44 shrink-0 flex-col gap-3 px-4 pt-5">
        <div className="flex h-12 items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-400 text-lg font-bold tracking-tight text-slate-950 shadow-sm"
          >
            TM
          </span>
          {!recolhida && (
            <span className="whitespace-nowrap text-lg font-semibold text-slate-900">
              Task Manager
            </span>
          )}
        </div>

        <div className="flex items-start justify-between gap-2">
          {!recolhida && (
            <p className="text-sm leading-6 text-slate-600">
              Um simples{" "}
              <span className="text-red-700">organizador de tarefas</span>
            </p>
          )}
          <button
            type="button"
            onClick={mobile ? onClose : () => setRecolhida((atual) => !atual)}
            aria-label={mobile ? "Fechar menu" : recolhida ? "Expandir menu" : "Recolher menu"}
            aria-expanded={mobile ? undefined : !recolhida}
            aria-controls={navigationId}
            title={mobile ? "Fechar menu" : recolhida ? "Expandir menu" : "Recolher menu"}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-slate-700 transition-colors hover:bg-orange-200 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 motion-reduce:transition-none"
          >
            <ToggleIcon size={22} aria-hidden="true" />
          </button>
        </div>
      </header>

      <nav
        id={navigationId}
        aria-label="Navegação principal"
        className="flex flex-col gap-2 px-3 pb-4"
      >
        <SidebarButton to="/" label="Início" recolhida={recolhida} onClick={onNavigate}>
          <House size={22} className="shrink-0" aria-hidden="true" />
        </SidebarButton>
        <SidebarButton to="/tasks" label="Minhas Tarefas" recolhida={recolhida} onClick={onNavigate}>
          <ListChecks size={22} className="shrink-0" aria-hidden="true" />
        </SidebarButton>
      </nav>
    </aside>
  )
}

Sidebar.propTypes = {
  mobile: PropTypes.bool,
  onClose: PropTypes.func,
  onNavigate: PropTypes.func,
}

export default Sidebar
