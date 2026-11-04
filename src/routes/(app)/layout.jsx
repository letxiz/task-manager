import { useEffect, useRef } from "react"
import { Menu } from "lucide-react"
import { Outlet } from "react-router-dom"
import Sidebar from "../../components/layout/Sidebar"
import WorkspaceHeader from "../../components/layout/WorkspaceHeader"

function AppLayout() {
  const menuRef = useRef(null)

  const closeMenu = () => menuRef.current?.close()

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)")
    const handleResize = () => {
      if (desktop.matches) menuRef.current?.close()
    }
    desktop.addEventListener("change", handleResize)
    return () => desktop.removeEventListener("change", handleResize)
  }, [])

  return (
    <div className="min-h-dvh bg-orange-50/50 text-slate-900 md:flex">
      <a
        href="#main-content"
        className="sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:not-sr-only focus:rounded-lg focus:bg-white focus:p-3"
      >
        Ir para o conteúdo
      </a>

      <div className="sticky top-0 hidden h-dvh shrink-0 md:block">
        <Sidebar />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-orange-200 bg-orange-100 px-4 py-3 md:hidden">
          <button
            type="button"
            aria-label="Abrir menu"
            aria-haspopup="dialog"
            aria-controls="mobile-menu"
            onClick={() => menuRef.current.showModal()}
            className="flex h-12 w-12 items-center justify-center rounded-xl hover:bg-orange-200 focus-visible:outline-2 focus-visible:outline-red-700"
          >
            <Menu aria-hidden="true" />
          </button>
          <span className="font-semibold">Task Manager</span>
        </header>

        <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 p-5 sm:p-8 lg:p-12">
          <WorkspaceHeader />
          <Outlet />
        </main>
      </div>

      <dialog
        ref={menuRef}
        id="mobile-menu"
        aria-label="Navegação principal"
        onClick={(event) => {
          if (event.target === event.currentTarget) closeMenu()
        }}
        className="fixed inset-y-0 left-0 m-0 h-dvh max-h-none w-72 max-w-[calc(100vw-2rem)] border-0 bg-orange-100 p-0 backdrop:bg-slate-950/40"
      >
        <Sidebar mobile onClose={closeMenu} onNavigate={closeMenu} />
      </dialog>
    </div>
  )
}

export default AppLayout
