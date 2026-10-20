import PropTypes from "prop-types"
import { X } from "lucide-react"

function TaskTopicModal({
  open,
  name,
  error,
  creationError,
  onNameChange,
  onClose,
  onSubmit,
}) {
  // Mantém o modal fora da árvore enquanto não estiver sendo usado.
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        // Só fecha ao clicar no fundo, sem interceptar cliques dentro do formulário.
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="topic-modal-title"
        className="w-[min(90vw,420px)] rounded-xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 id="topic-modal-title" className="text-xl font-semibold text-slate-800">
            Novo tópico
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
              className="cursor-pointer rounded-xl bg-red-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-800"
            >
              Criar tópico
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

TaskTopicModal.propTypes = {
  open: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
  error: PropTypes.string,
  creationError: PropTypes.string,
  onNameChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
}

export default TaskTopicModal