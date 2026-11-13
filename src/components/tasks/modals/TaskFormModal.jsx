import { useDialog } from "../../../hooks/useDialog"
import PropTypes from "prop-types"
import { AlertCircle, X } from "lucide-react"
import MiniCalendario from "../controls/MiniCalendario"

function TaskFormModal({
  editing = false,
  topicos = [],
  topicoId = "",
  onTopicChange,
  open,
  janelaExpandida,
  titulo,
  descricao,
  data,
  erroTitulo,
  erroCriacao,
  onClose,
  onSubmit,
  onTitleChange,
  onDescriptionChange,
  onDateChange,
  onExpand,
  onContract,
}) {
  const { dialogRef, handleCancel, handleBackdropClick } = useDialog(
    open,
    onClose
  )

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="modal-titulo"
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      className={`fixed inset-0 m-auto max-h-[92dvh] w-[90vw] overflow-y-auto rounded-2xl border-0 bg-white p-6 text-slate-900 shadow-xl backdrop:bg-black/50 ${
        janelaExpandida ? "max-w-[560px]" : "max-w-[420px]"
      }`}
    >
      {open && (
        <>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2
                id="modal-titulo"
                className="text-xl font-semibold text-slate-800"
              >
                {editing ? "Editar tarefa" : "Nova tarefa"}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar formulário"
              className="cursor-pointer rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            >
              <X size={20} />
            </button>
          </div>

          <form
            noValidate
            onSubmit={(event) => {
              // Bloqueia datas inválidas.
              if (!event.currentTarget.reportValidity()) {
                event.preventDefault()
                return
              }
              onSubmit(event)
            }}
            className="mt-6 space-y-4"
          >
            <div>
              <label
                htmlFor="titulo"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Título *
              </label>

              <input
                id="titulo"
                type="text"
                value={titulo}
                onChange={(event) => {
                  const novoTitulo = event.target.value
                  onTitleChange(novoTitulo)
                }}
                placeholder="Ex.: Ir para a academia"
                maxLength={100}
                autoFocus
                aria-invalid={Boolean(erroTitulo)}
                aria-describedby={erroTitulo ? "titulo-error" : undefined}
                className={`w-full rounded-xl border px-3 py-2.5 outline-none focus:ring-2 focus:ring-red-100 ${
                  erroTitulo
                    ? "border-red-500 focus:border-red-600"
                    : "border-slate-300 focus:border-red-600"
                }`}
              />

              {erroTitulo && (
                <p
                  id="titulo-error"
                  role="alert"
                  className="mt-2 flex items-center gap-2 text-sm font-medium text-red-600"
                >
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{erroTitulo}</span>
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="descricao"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Descrição
              </label>

              <textarea
                id="descricao"
                value={descricao}
                onChange={(event) => onDescriptionChange(event.target.value)}
                placeholder="Descreva o que precisa fazer..."
                rows={4}
                maxLength={500}
                className="h-28 w-full resize-none rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100"
              />

              <div className="mt-1 text-right text-xs text-slate-500">
                {descricao.length}/500
              </div>
            </div>

            <div>
              <label
                htmlFor="data"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Data
              </label>

              <MiniCalendario
                valor={data}
                onSelecionar={onDateChange}
                onExpandir={onExpand}
                onContrair={onContract}
              />
            </div>

            {/* Tópico opcional. */}
            {topicos.length > 0 && (
              <div>
                <label
                  htmlFor="tarefa-topico"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Tópico
                </label>
                <select
                  id="tarefa-topico"
                  value={topicoId}
                  onChange={(event) => onTopicChange(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Sem tópico</option>
                  {topicos.map((topico) => (
                    <option key={topico.id} value={topico.id}>
                      {topico.nome}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {erroCriacao && (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800"
              >
                {erroCriacao}
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
                {editing ? "Salvar alterações" : "Salvar tarefa"}
              </button>
            </div>
          </form>
        </>
      )}
    </dialog>
  )
}

TaskFormModal.propTypes = {
  topicos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      nome: PropTypes.string.isRequired,
    })
  ),
  topicoId: PropTypes.string,
  onTopicChange: PropTypes.func.isRequired,
  editing: PropTypes.bool,
  open: PropTypes.bool.isRequired,
  janelaExpandida: PropTypes.bool.isRequired,
  titulo: PropTypes.string.isRequired,
  descricao: PropTypes.string.isRequired,
  data: PropTypes.string.isRequired,
  erroTitulo: PropTypes.string,
  erroCriacao: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onTitleChange: PropTypes.func.isRequired,
  onDescriptionChange: PropTypes.func.isRequired,
  onDateChange: PropTypes.func.isRequired,
  onExpand: PropTypes.func,
  onContract: PropTypes.func,
}

export default TaskFormModal
