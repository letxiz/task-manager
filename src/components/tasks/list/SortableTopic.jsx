import { useState } from "react"
import PropTypes from "prop-types"
import { GripVertical, ChevronUp, FolderOpen } from "lucide-react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { getTopicColor } from "../../../constants/topicColors"
import ItemActions from "../controls/ItemActions"
import Tooltip from "../controls/Tooltip"
import { useTooltip } from "../../../hooks/tasks/useTooltip"

function SortableTopic({ topic, children, onDeleteTopic, onEditTopic }) {
  // Controla a exibição das tarefas deste tópico.
  const [recolhido, setRecolhido] = useState(false)
  const dragTooltip = useTooltip()
  const color = getTopicColor(topic.cor)
  // Identifica o tópico no arraste.
  const {
    attributes,
    isDragging,
    isOver,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: `topic:${topic.id}`,
    data: { kind: "topic", topicId: topic.id },
  })
  const dragDescribedBy = [attributes["aria-describedby"], dragTooltip.id]
    .filter(Boolean)
    .join(" ")

  return (
    <section
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      aria-labelledby={`topic-${topic.id}`}
      className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${color.surface} transition-colors ${
        isOver ? "ring-2 ring-primary/30" : ""
      } ${isDragging ? "opacity-50" : ""}`}
    >
      <div className={`flex items-center gap-2 border-b px-3 py-3 sm:px-4 ${color.surface} ${color.text}`}>
        <Tooltip
          id={dragTooltip.id}
          open={dragTooltip.open}
          wrapperProps={dragTooltip.wrapperProps}
          content="Segure para arrastar e reordenar"
        >
          <button
            ref={setActivatorNodeRef}
            type="button"
            {...attributes}
            {...listeners}
            onClick={dragTooltip.triggerProps.onClick}
            aria-describedby={dragDescribedBy}
            aria-label={`Arrastar tópico ${topic.nome}`}
            className="cursor-grab rounded-md p-1.5 text-slate-500 hover:bg-orange-100 active:cursor-grabbing"
          >
            <GripVertical size={18} aria-hidden="true" />
          </button>
        </Tooltip>
        <h2 id={`topic-${topic.id}`} className={`min-w-0 flex-1 break-words text-base font-semibold`}>
          <ItemActions name={topic.nome} onEdit={() => onEditTopic(topic, true)} onDelete={() => onDeleteTopic(topic)}>
            <FolderOpen size={18} className={`shrink-0 ${color.text}`} /><span className="min-w-0 break-words">{topic.nome}</span>
          </ItemActions>
        </h2>
        <button type="button" onClick={() => setRecolhido((value) => !value)} aria-label={`${recolhido ? "Expandir" : "Recolher"} tópico ${topic.nome}`} aria-expanded={!recolhido} className="rounded-lg p-2 text-muted hover:bg-stone-200/60"><ChevronUp size={16} className={recolhido ? "rotate-180" : ""} /></button>
      </div>
      {/* Exibe as tarefas apenas quando o grupo está expandido. */}
      {!recolhido && children}
    </section>
  )
}

SortableTopic.propTypes = {
  onEditTopic: PropTypes.func.isRequired,
  onDeleteTopic: PropTypes.func.isRequired,
  topic: PropTypes.shape({
    id: PropTypes.string.isRequired,
    nome: PropTypes.string.isRequired,
    cor: PropTypes.string,
  }).isRequired,
  children: PropTypes.node.isRequired,
}


export default SortableTopic
