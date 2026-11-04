import PropTypes from "prop-types"
import { useDroppable } from "@dnd-kit/core"

function UnassignedDropZone({ children }) {
  const { isOver, setNodeRef } = useDroppable({
    id: "unassigned-tasks",
    data: { kind: "unassigned" },
  })

  return (
    <section
      ref={setNodeRef}
      aria-labelledby="unassigned-title"
      className={`rounded-2xl border border-dashed p-4 transition-colors ${
        isOver ? "border-orange-400 bg-orange-50" : "border-slate-300 bg-white/60"
      }`}
    >
      <h2
        id="unassigned-title"
        className="border-b border-slate-200 pb-2 font-semibold text-slate-800"
      >
        Sem tópico
      </h2>
      {children}
    </section>
  )
}

UnassignedDropZone.propTypes = {
  children: PropTypes.node.isRequired,
}


export default UnassignedDropZone
