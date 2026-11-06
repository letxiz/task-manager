import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { CalendarDays, ChevronRight, LayoutGrid } from "lucide-react"
import { formatarDataISO } from "../../utils/dateUtils"

export default function WorkspaceHeader() {
  const { pathname } = useLocation()
  const [data, setData] = useState(() => new Date())
  // O caminho acompanha a navegação.
  const caminho = pathname.replace(/\/+$/, "") || "/"
  const pagina = caminho === "/" ? "Início" : caminho === "/tasks" ? "Minhas tarefas" : "Página não encontrada"

  useEffect(() => {
    const atualizar = () => setData(new Date())
    const timer = setInterval(atualizar, 60000)
    window.addEventListener("focus", atualizar)
    // Exibe o caminho da página e a data no cabeçalho.
  return () => {
      clearInterval(timer)
      window.removeEventListener("focus", atualizar)
    }
  }, [])

  return (
    <div className="mb-7 flex flex-wrap items-center justify-between gap-3 border-b border-stone-300 pb-5 text-xs text-muted">
      <nav aria-label="Localização">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link to="/" className="inline-flex min-h-9 items-center gap-2 rounded-lg px-2 transition-colors hover:bg-orange-100 hover:text-primary focus-visible:outline-2 focus-visible:outline-primary">
              <LayoutGrid size={14} aria-hidden="true" />Meu espaço
            </Link>
          </li>
          <li aria-hidden="true"><ChevronRight size={14} /></li>
          <li aria-current="page" className="font-medium text-slate-800">{pagina}</li>
        </ol>
      </nav>
      <time dateTime={formatarDataISO(data)} className="inline-flex items-center gap-2">
        <CalendarDays size={14} aria-hidden="true" />
        {data.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
      </time>
    </div>
  )
}
