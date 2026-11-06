import { useEffect, useId, useRef } from "react"
import PropTypes from "prop-types"
import { Pencil, X } from "lucide-react"
import { getTopicColor } from "../../../constants/topicColors"

export default function DetailsModal({ item, kind, topicName, taskCount, onClose, onEdit }) {
  const dialogRef = useRef(null)
  const titleId = useId()
  const isTopic = kind === "topic"

  useEffect(() => {
    const dialog = dialogRef.current
    if (item) dialog.showModal()
    else dialog.close()
  }, [item])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => { event.preventDefault(); onClose() }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return
        // Fecha ao clicar fora.
        const rect = event.currentTarget.getBoundingClientRect()
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose()
      }}
      className="fixed inset-0 m-auto max-h-[92dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl border-0 bg-white p-6 text-slate-900 shadow-xl backdrop:bg-slate-950/50"
    >
      {item && <>
        <header className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-xl font-semibold">Detalhes {isTopic ? "do tópico" : "da tarefa"}</h2>
          <button type="button" onClick={onClose} aria-label="Fechar detalhes" className="rounded-lg p-2 text-muted hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-primary">
            <X size={20} aria-hidden="true" />
          </button>
        </header>
        <dl className="mt-6 space-y-4 text-sm">
          <div><dt className="font-medium text-muted">{isTopic ? "Nome" : "Título"}</dt><dd className="mt-1 whitespace-pre-wrap break-words text-base font-semibold">{isTopic ? item.nome : item.titulo}</dd></div>
          {isTopic ? <>
            <div><dt className="font-medium text-muted">Cor</dt><dd className="mt-2 flex items-center gap-2"><span aria-hidden="true" className={`size-5 rounded-full ${getTopicColor(item.cor).swatch}`} />{getTopicColor(item.cor).label}</dd></div>
            <div><dt className="font-medium text-muted">Quantidade de tarefas</dt><dd className="mt-1">{taskCount}</dd></div>
          </> : <>
            <div><dt className="font-medium text-muted">Descrição</dt><dd className="mt-1 whitespace-pre-wrap break-words">{item.descricao || "Sem descrição"}</dd></div>
            <div><dt className="font-medium text-muted">Prazo</dt><dd className="mt-1">{item.data ? new Date(`${item.data}T00:00:00`).toLocaleDateString("pt-BR") : "Sem prazo"}</dd></div>
            <div><dt className="font-medium text-muted">Status</dt><dd className="mt-1">{item.concluida ? "Concluída" : "Pendente"}</dd></div>
            <div><dt className="font-medium text-muted">Tópico</dt><dd className="mt-1 break-words">{topicName || "Sem tópico"}</dd></div>
          </>}
        </dl>
        <footer className="mt-6 flex flex-wrap justify-end gap-3">
          <button type="button" onClick={onEdit} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"><Pencil size={16} aria-hidden="true" />Editar</button>
          <button type="button" autoFocus onClick={onClose} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-primary">Cancelar</button>
        </footer>
      </>}
    </dialog>
  )
}

DetailsModal.propTypes = {
  item: PropTypes.object,
  kind: PropTypes.oneOf(["task", "topic"]),
  topicName: PropTypes.string,
  taskCount: PropTypes.number,
  onClose: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
}
