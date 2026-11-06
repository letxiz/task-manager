import { useId, useRef } from "react"
import { createPortal } from "react-dom"
import PropTypes from "prop-types"
import { EllipsisVertical, Pencil, Trash2, X } from "lucide-react"

export default function ItemActions({ name, onEdit, onDelete, disabled = false, children }) {
  const dialogRef = useRef(null)
  const titleId = useId()

  function runAction(action) {
    dialogRef.current.close()
    action()
  }

  return <>
    <button type="button" disabled={disabled} aria-label={`Mais opções de ${name}`} aria-haspopup="dialog" onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); dialogRef.current.showModal() }} className={`${children ? "flex w-full items-center gap-2 px-2 py-2 text-left" : "shrink-0 p-2 text-muted"} cursor-pointer rounded-lg hover:bg-stone-200/60 focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-default`}>
      {children || <EllipsisVertical size={18} aria-hidden="true" />}
    </button>
    {createPortal(
      <dialog ref={dialogRef} aria-labelledby={titleId} onPointerDown={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()} onClick={(event) => {
        event.stopPropagation()
        if (event.target !== event.currentTarget) return
        const rect = event.currentTarget.getBoundingClientRect()
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) event.currentTarget.close()
      }} className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-[260px] rounded-xl border-0 bg-white p-3 text-stone-800 shadow-xl backdrop:bg-stone-950/40">
        <header className="mb-1 flex items-center justify-between gap-3">
          <h2 id={titleId} className="min-w-0 break-words text-sm font-semibold">{name}</h2>
          <button type="button" onClick={() => dialogRef.current.close()} aria-label="Fechar opções" className="shrink-0 cursor-pointer rounded-lg p-2 text-muted hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-primary"><X size={18} aria-hidden="true" /></button>
        </header>
        <div className="space-y-1">
          <button type="button" onClick={() => runAction(onEdit)} className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-left hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-primary"><Pencil size={16} aria-hidden="true" />Editar</button>
          <button type="button" onClick={() => runAction(onDelete)} className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-left text-danger hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-danger"><Trash2 size={16} aria-hidden="true" />Excluir</button>
        </div>
      </dialog>, document.body,
    )}
  </>
}

ItemActions.propTypes = {
  name: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  children: PropTypes.node,
}
