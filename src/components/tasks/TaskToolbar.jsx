import PropTypes from "prop-types"
import { useEffect, useRef, useState } from "react"
import { AlertTriangle, ListPlus, Plus, Tag, Trash2 } from "lucide-react"

function TaskToolbar({
  taskCount,
  hasItems,
  onClear,
  onCreateTask,
  onCreateTopic,
}) {
  const [menuAberto, setMenuAberto] = useState(false)
  const [confirmacaoAberta, setConfirmacaoAberta] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!menuAberto) return undefined

    function fecharAoClicarFora(event) {
      if (!menuRef.current?.contains(event.target)) {
        setMenuAberto(false)
      }
    }

    function fecharComEscape(event) {
      if (event.key === "Escape") {
        setMenuAberto(false)
      }
    }

    document.addEventListener("pointerdown", fecharAoClicarFora)
    document.addEventListener("keydown", fecharComEscape)
    return () => {
      document.removeEventListener("pointerdown", fecharAoClicarFora)
      document.removeEventListener("keydown", fecharComEscape)
    }
  }, [menuAberto])

  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
      <span className="text-lg font-bold text-slate-700">
        Tarefas: {taskCount}
      </span>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setConfirmacaoAberta(true)}
          disabled={!hasItems}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-500 transition-colors hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Limpar
          <Trash2 size={18} />
        </button>

        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuAberto((aberto) => !aberto)}
            aria-expanded={menuAberto}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
          >
            Novo <Plus size={18} />
          </button>

          {menuAberto && (
            <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
              <button
                type="button"
                onClick={() => {
                  // Fecha o menu antes de abrir o formulário escolhido.
                  setMenuAberto(false)
                  onCreateTask()
                }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
              >
                <ListPlus size={16} /> Tarefa
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuAberto(false)
                  onCreateTopic()
                }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
              >
                <Tag size={16} /> Tópico
              </button>
            </div>
          )}
        </div>
      </div>

      {confirmacaoAberta && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setConfirmacaoAberta(false)
            }
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="clear-confirmation-title"
            aria-describedby="clear-confirmation-description"
            className="w-[min(90vw,420px)] rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-start gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700">
                <AlertTriangle size={22} aria-hidden="true" />
              </span>
              <div>
                <h2
                  id="clear-confirmation-title"
                  className="text-lg font-semibold text-slate-800"
                >
                  Limpar toda a lista?
                </h2>
                <p
                  id="clear-confirmation-description"
                  className="mt-2 text-sm leading-6 text-slate-600"
                >
                  Todas as tarefas e todos os tópicos serão excluídos. Essa ação
                  não pode ser desfeita.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmacaoAberta(false)}
                className="cursor-pointer rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmacaoAberta(false)
                  onClear()
                }}
                className="cursor-pointer rounded-xl bg-red-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-800"
              >
                Limpar tudo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

TaskToolbar.propTypes = {
  taskCount: PropTypes.number.isRequired,
  hasItems: PropTypes.bool.isRequired,
  onClear: PropTypes.func.isRequired,
  onCreateTask: PropTypes.func.isRequired,
  onCreateTopic: PropTypes.func.isRequired,
}

export default TaskToolbar
