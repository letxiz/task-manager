import { useEffect, useRef } from "react"
import { TOPIC_COLORS } from "../../constants/topicColors"
import PropTypes from "prop-types"
import { Check, X } from "lucide-react"

function TaskTopicModal({
  editing = false,
  open,
  name,
  color,
  onColorChange,
  error,
  creationError,
  onNameChange,
  onClose,
  onSubmit,
}) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (open) dialog.showModal()
    else dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="topic-modal-title"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return
        const rect = event.currentTarget.getBoundingClientRect()
        if (event.clientX < rect.left || event.clientX > rect.right ||
            event.clientY < rect.top || event.clientY > rect.bottom) onClose()
      }}
      className="fixed inset-0 m-auto max-h-[92dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl border-0 bg-white p-6 text-slate-900 shadow-xl backdrop:bg-slate-950/50"
    >
        <div className="flex items-center justify-between gap-4">
          <h2 id="topic-modal-title" className="text-xl font-semibold text-slate-800">
            {editing ? "Editar tópico" : "Novo tópico"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar formulário"
            className="cursor-pointer rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <form noValidate onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="topic-name"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Nome do tópico
            </label>
            <input
              id="topic-name"
              autoFocus
              maxLength={60}
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              placeholder="Ex.: Trabalho"
              aria-invalid={Boolean(error)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100"
            />
            {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
          </div>

          <fieldset>
            <legend className="mb-3 text-sm font-medium text-slate-700">Cor do tópico</legend>
            <div className="flex flex-wrap gap-3">
              {TOPIC_COLORS.map((option) => (
                <label key={option.id} className="flex cursor-pointer flex-col items-center gap-1 text-xs text-slate-600">
                  <input
                    type="radio"
                    name="topic-color"
                    value={option.id}
                    checked={color === option.id}
                    onChange={() => onColorChange(option.id)}
                    className="peer sr-only"
                  />
                  <span aria-hidden="true" className={`flex size-10 items-center justify-center rounded-full border-4 border-white text-white ring-2 ring-transparent peer-checked:ring-slate-700 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-primary ${option.swatch}`}>
                    {color === option.id && <Check size={18} strokeWidth={3} />}
                  </span>
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>

          {creationError && (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800"
            >
              {creationError}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="cursor-pointer rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
            >
              {editing ? "Salvar alterações" : "Criar tópico"}
            </button>
          </div>
        </form>
    </dialog>
  )
}

TaskTopicModal.propTypes = {
  editing: PropTypes.bool,
  open: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
  color: PropTypes.oneOf(TOPIC_COLORS.map((option) => option.id)).isRequired,
  onColorChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  creationError: PropTypes.string,
  onNameChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
}

export default TaskTopicModal
