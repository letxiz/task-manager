import { useEffect, useId, useRef } from "react"
import PropTypes from "prop-types"
import { TriangleAlert } from "lucide-react"

export default function ConfirmDialog({ open, title, message, onCancel, onConfirm, confirmLabel = "Excluir tarefas" }) {
  const dialogRef = useRef(null)
  const titleId = useId()
  const messageId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (open) dialog.showModal()
    else dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={messageId}
      onCancel={(event) => {
        event.preventDefault()
        onCancel()
      }}
      className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl border-0 bg-white p-6 text-slate-900 shadow-xl backdrop:bg-slate-950/50"
    >
      <TriangleAlert aria-hidden="true" className="mb-4 text-danger" size={28} />
      <h2 id={titleId} className="text-xl font-semibold">{title}</h2>
      <p id={messageId} className="mt-3 text-sm leading-6 text-slate-600">{message}</p>
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button type="button" autoFocus onClick={onCancel} className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-primary">
          Cancelar
        </button>
        <button type="button" onClick={onConfirm} className="rounded-xl bg-danger px-4 py-3 text-sm font-medium text-white hover:bg-danger-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger">
          {confirmLabel}
        </button>
      </div>
    </dialog>
  )
}

ConfirmDialog.propTypes = {
  confirmLabel: PropTypes.string,
  open: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
}
