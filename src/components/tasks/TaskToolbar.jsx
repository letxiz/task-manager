import { useEffect, useId, useRef, useState } from "react"
import PropTypes from "prop-types"
import { FolderPlus, ChevronDown, Plus, Trash2 } from "lucide-react"

export default function TaskToolbar({ onCreateTask, onCreateTopic, onClear, clearDisabled }) {
  const [actionsOpen, setActionsOpen] = useState(false)
  const actionsRef = useRef(null)
  const triggerRef = useRef(null)
  const actionsId = useId()

  useEffect(() => {
    if (!actionsOpen) return
    function closeOutside(event) {
      if (!actionsRef.current?.contains(event.target)) setActionsOpen(false)
    }
    function closeOnEscape(event) {
      if (event.key === "Escape") {
        setActionsOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener("pointerdown", closeOutside)
    document.addEventListener("keydown", closeOnEscape)
    return () => {
      document.removeEventListener("pointerdown", closeOutside)
      document.removeEventListener("keydown", closeOnEscape)
    }
  }, [actionsOpen])

  return <>
    {/* Criação de tarefa em destaque e ações secundárias no menu. */}
    <header className="flex flex-wrap items-center justify-between gap-5">
      <div><h1 className="text-3xl font-semibold tracking-tight">Minhas Tarefas</h1><p className="mt-2 text-base text-muted">Organize aqui o que precisa fazer.</p></div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onCreateTask} className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-base font-medium text-white cursor-pointer transition-[background-color,box-shadow] duration-150 hover:bg-primary-hover hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none"><Plus size={16} />Nova tarefa</button>
        <div ref={actionsRef} className="relative" onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setActionsOpen(false)
        }}>
          <button ref={triggerRef} type="button" aria-label="Ações de tarefas" aria-expanded={actionsOpen} aria-controls={actionsId}
            onClick={() => setActionsOpen((open) => !open)}
            className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 px-4 py-3 text-base font-medium rounded-2xl border border-stone-300 bg-white text-muted transition-colors hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            Ações<ChevronDown size={16} aria-hidden="true" className={`transition-transform motion-reduce:transition-none ${actionsOpen ? "rotate-180" : ""}`} />
          </button>
          <div id={actionsId} hidden={!actionsOpen} className="absolute right-0 top-full z-20 mt-2 w-56 rounded-xl border border-stone-200 bg-white p-1.5 shadow-lg">
            <button type="button" aria-haspopup="dialog" onClick={() => {
              setActionsOpen(false)
              triggerRef.current?.focus()
              onCreateTopic()
            }} className="flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-primary">
              <FolderPlus size={16} aria-hidden="true" />Novo tópico
            </button>
            <hr className="my-1 border-stone-100" />
            <button type="button" disabled={clearDisabled} onClick={() => {
              setActionsOpen(false)
              triggerRef.current?.focus()
              onClear()
            }} className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-danger enabled:cursor-pointer enabled:hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-danger disabled:text-muted disabled:opacity-40">
              <Trash2 size={16} aria-hidden="true" />Limpar tudo
            </button>
          </div>
        </div>
      </div>
    </header>
  </>
}
TaskToolbar.propTypes = {
  onCreateTask: PropTypes.func.isRequired,
  onCreateTopic: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  clearDisabled: PropTypes.bool.isRequired,
}
