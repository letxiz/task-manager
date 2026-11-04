import PropTypes from "prop-types"
import { GripVertical, Trash2 } from "lucide-react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { getTopicColor } from "../../constants/topicColors"
import Tooltip from "./Tooltip"
import { useTooltip } from "./useTooltip"

function SortableTopic({ topic, children, onDeleteTopic, onEditTopic }) {
  const color = getTopicColor(topic.cor)
  const dragTooltip = useTooltip()
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
      className={`rounded-2xl border p-4 transition-colors ${color.surface} ${
        isOver ? "ring-2 ring-primary/30" : ""
      } ${isDragging ? "opacity-50" : ""}`}
    >
      <div
        // Ignora os botões do cabeçalho.
        onClick={(event) => {
          if (!isDragging && !event.target.closest("button")) onEditTopic(topic)
        }}
        className={`flex cursor-pointer items-center gap-2 border-b border-current/10 pb-2 ${color.text}`}
      >
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
        <h2 id={`topic-${topic.id}`} className={`min-w-0 flex-1 break-words font-semibold ${color.text}`}>
          <button type="button" onClick={() => onEditTopic(topic)} aria-label={`Ver detalhes do tópico ${topic.nome}`} className="min-h-11 w-full cursor-pointer rounded-lg px-2 py-2 text-left break-words transition-colors hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-primary">
            {topic.nome}
          </button>
        </h2>
        <button
          type="button"
          onClick={() => onDeleteTopic(topic)}
          aria-label={`Excluir tópico ${topic.nome}`}
          title="Excluir tópico"
          className="shrink-0 rounded-lg p-2 text-muted hover:bg-white/70 hover:text-danger focus-visible:outline-2 focus-visible:outline-danger"
        >
          <Trash2 size={18} aria-hidden="true" />
        </button>
      </div>
      {children}
    </section>
  )
}

SortableTopic.propTypes = {
  onEditTopic: PropTypes.func.isRequired,
  onDeleteTopic: PropTypes.func.isRequired,
  topic: PropTypes.shape({
    id: PropTypes.string.isRequired,
    nome: PropTypes.string.isRequired,
  }).isRequired,
  children: PropTypes.node.isRequired,
}


export default SortableTopic
