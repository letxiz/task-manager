import PropTypes from "prop-types"
import { Pencil } from "lucide-react"
import { useDroppable } from "@dnd-kit/core"

function UnassignedDropZone({ children, onEdit }) {
  const { isOver, setNodeRef } = useDroppable({
    id: "unassigned-tasks",
    data: { kind: "unassigned" },
  })

  return (
    <section
      ref={setNodeRef}
      aria-labelledby="unassigned-title"
      className={`overflow-hidden rounded-2xl border-2 border-dashed p-4 transition-colors ${
        isOver ? "border-orange-400 bg-orange-50" : "border-stone-400 bg-white"
      }`}
    >
      <h2
        id="unassigned-title"
        className="border-b border-slate-200 pb-2 font-semibold text-slate-800"
      >
        <button type="button" onClick={onEdit} aria-label="Editar Sem tópico" aria-haspopup="dialog" className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-2 text-left hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-primary">
          Sem tópico<Pencil size={16} aria-hidden="true" className="text-muted" />
        </button>
      </h2>
      {children}
    </section>
  )
}

UnassignedDropZone.propTypes = {
  children: PropTypes.node.isRequired,
  onEdit: PropTypes.func.isRequired,
}


export default UnassignedDropZone
