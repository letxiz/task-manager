import TaskStatusBadge from "../tasks/TaskStatusBadge"
import { memo, useMemo, useState } from "react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"
import {
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  ListChecks,
  Plus,
} from "lucide-react"
import { formatarDataExibicao } from "../../utils/dateUtils"
import { diaLocal } from "../../utils/waterStorage"
import { resumirTarefas, paginarResumoTarefas } from "../../utils/homeTasks"

function HomeTaskList({
  tarefas,
  topicos,
  onToggle,
  onDetails,
  onCreate,
  hoje = diaLocal(),
}) {
  const [pagina, setPagina] = useState(1)
  const resumo = useMemo(() => resumirTarefas(tarefas, tarefas.length), [tarefas])
  const { total, visiveis, paginaAtual, totalPaginas } = paginarResumoTarefas(resumo, pagina)
  // Ajusta a página quando a lista encolhe.
  if (pagina !== paginaAtual) setPagina(paginaAtual)

  return (
    <section
      aria-labelledby="home-tasks-title"
      className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-orange-200 bg-white transition duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md focus-within:border-primary/30 focus-within:shadow-md motion-reduce:transform-none motion-reduce:transition-none"
    >
      <header className="flex items-center justify-between gap-3 border-b border-orange-100 p-5 sm:px-6">
        <div>
          <h2 id="home-tasks-title" className="text-lg font-semibold">
            Suas tarefas
          </h2>
          <p className="mt-1 text-sm leading-5 text-muted">
            Um pouco de foco, um passo de cada vez.
          </p>
        </div>
        <Link
          to="/tasks"
          className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-lg px-2 text-sm font-medium text-primary hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-primary"
        >
          Ver todas
          <ArrowUpRight size={14} aria-hidden="true" />
        </Link>
      </header>
      {total === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
          <ListChecks size={36} className="text-primary" aria-hidden="true" />
          <h3 className="mt-4 font-semibold">Um novo começo</h3>
          <p className="mt-2 max-w-xs text-sm leading-6 text-muted">
            Sua lista está vazia. Adicione a primeira tarefa e organize seu dia.
          </p>
          <button
            type="button"
            onClick={onCreate}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-white hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Plus size={16} aria-hidden="true" />
            Criar tarefa
          </button>
        </div>
      ) : (
        <ul className="flex-1 divide-y divide-orange-100">
          {visiveis.map((tarefa) => {
            const topico = topicos.find((item) => item.id === tarefa.topicoId)
            const prazo = !tarefa.data
              ? "Sem prazo"
              : tarefa.data === hoje
                ? "Hoje"
                : formatarDataExibicao(tarefa.data)
            const atrasada =
              !tarefa.concluida && tarefa.data && tarefa.data < hoje
            return (
              <li
                key={tarefa.id}
                className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-orange-50/50 sm:px-6"
              >
                <label className="relative flex size-5 shrink-0 cursor-pointer items-center justify-center">
                  <input
                    type="checkbox"
                    checked={tarefa.concluida}
                    onChange={() => onToggle(tarefa.id)}
                    aria-label={`${tarefa.concluida ? "Reabrir" : "Concluir"} tarefa ${tarefa.titulo}`}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={`flex size-4 items-center justify-center rounded border peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary ${tarefa.concluida ? "border-success bg-success text-white" : "border-orange-300 bg-white"}`}
                  >
                    {tarefa.concluida && <Check size={12} strokeWidth={3} />}
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => onDetails(tarefa)}
                  className="min-w-0 flex-1 rounded-lg text-left focus-visible:outline-2 focus-visible:outline-primary"
                  aria-label={`Ver detalhes da tarefa ${tarefa.titulo}`}
                >
                  <span
                    className={`block break-words text-base font-medium ${tarefa.concluida ? "text-muted line-through" : "text-slate-800"}`}
                  >
                    {tarefa.titulo}
                  </span>
                  <span className="mt-1 block break-words text-sm text-muted">
                    {topico?.nome || "Sem tópico"} · {prazo}
                    {atrasada ? " · Prazo vencido" : ""}
                  </span>
                </button>
                <TaskStatusBadge
                  completed={tarefa.concluida}
                  className="shrink-0"
                />
              </li>
            )
          })}
        </ul>
      )}
      {totalPaginas > 1 && (
        <nav
          aria-label="Paginação das tarefas do início"
          className="flex items-center justify-between gap-3 border-t border-stone-100 px-5 py-3 text-sm sm:px-6"
        >
          <button
            type="button"
            aria-label="Página anterior"
            disabled={paginaAtual === 1}
            onClick={() => setPagina(paginaAtual - 1)}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-muted enabled:cursor-pointer enabled:hover:bg-stone-50 enabled:hover:text-primary focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ChevronLeft size={16} aria-hidden="true" />
            Anterior
          </button>
          <button
            type="button"
            aria-label="Próxima página"
            disabled={paginaAtual === totalPaginas}
            onClick={() => setPagina(paginaAtual + 1)}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-muted enabled:cursor-pointer enabled:hover:bg-stone-50 enabled:hover:text-primary focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-35"
          >
            Próxima
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </nav>
      )}
    </section>
  )
}

HomeTaskList.propTypes = {
  hoje: PropTypes.string,
  tarefas: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      titulo: PropTypes.string.isRequired,
      data: PropTypes.string,
      topicoId: PropTypes.string,
      concluida: PropTypes.bool.isRequired,
    })
  ).isRequired,
  topicos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      nome: PropTypes.string.isRequired,
    })
  ).isRequired,
  onToggle: PropTypes.func.isRequired,
  onDetails: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
}

export default memo(HomeTaskList)
