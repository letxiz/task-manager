import PropTypes from "prop-types"
import { useEffect, useRef, useState } from "react"
import { ListPlus, Plus, Tag, Trash2 } from "lucide-react"

function TaskToolbar({
  taskCount,
  hasItems,
  onClear,
  onCreateTask,
  onCreateTopic,
}) {
  const [menuAberto, setMenuAberto] = useState(false)
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
          onClick={onClear}
          disabled={!hasItems}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-muted transition-colors enabled:hover:text-danger disabled:cursor-not-allowed disabled:opacity-40"
        >
          Limpar
          <Trash2 size={18} />
        </button>

        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuAberto((aberto) => !aberto)}
            aria-expanded={menuAberto}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
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
