import PropTypes from "prop-types"
import { GripVertical } from "lucide-react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  arrayMove,
  sortableKeyboardCoordinates,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import TaskEmptyState from "./TaskEmptyState"
import TaskItem from "./TaskItem"
import Tooltip, { useTooltip } from "./Tooltip"

function SortableTopic({ topic, children }) {
  const dragTooltip = useTooltip()
  // O identificador e os metadados permitem distinguir tópicos de tarefas no arraste.
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
      className={`rounded-2xl transition-colors ${
        isOver ? "bg-orange-50" : ""
      } ${isDragging ? "opacity-50" : ""}`}
    >
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <Tooltip
          id={dragTooltip.id}
          open={dragTooltip.open}
          wrapperProps={dragTooltip.wrapperProps}
          content="Arrastar para reordenar"
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
        <h2 id={`topic-${topic.id}`} className="flex-1 font-semibold text-slate-800">
          {topic.nome}
        </h2>
      </div>
      {children}
    </section>
  )
}

SortableTopic.propTypes = {
  topic: PropTypes.shape({
    id: PropTypes.string.isRequired,
    nome: PropTypes.string.isRequired,
  }).isRequired,
  children: PropTypes.node.isRequired,
}

function UnassignedDropZone({ children }) {
  // Esta área aceita tarefas sem tópico ou que estejam sendo removidas de um tópico.
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

function TaskList({ tarefas, topicos, onToggle, onDelete, onMoveTask, onReorderTopicos }) {
  // Permite arrastar com mouse/toque ou teclado, mantendo coordenadas próprias para teclado.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // IDs de tópico inexistentes também são tratados como tarefas sem tópico.
  const tarefasSemTopico = tarefas.filter(
    (tarefa) =>
      !tarefa.topicoId || !topicos.some((topico) => topico.id === tarefa.topicoId)
  )

  function renderizarTarefas(lista, idTopico) {
    if (lista.length === 0) {
      return <p className="py-3 text-sm text-slate-500">Nenhuma tarefa neste tópico.</p>
    }

    return (
      <SortableContext
        items={lista.map((tarefa) => `task:${tarefa.id}`)}
        strategy={verticalListSortingStrategy}
      >
        <ul className="mt-3 space-y-3">
          {lista.map((tarefa) => (
          <TaskItem
            key={tarefa.id}
            task={tarefa}
            topicId={idTopico}
            onToggle={onToggle}
            onDelete={onDelete}
          />
          ))}
        </ul>
      </SortableContext>
    )
  }

  function handleDragEnd({ active, over }) {
    if (!over) return

    const itemArrastado = active.data.current
    const alvo = over.data.current

    // Ao arrastar um tópico, só reordena quando o destino é outro tópico válido.
    if (itemArrastado?.kind === "topic") {
      const topicoAlvoId =
        alvo?.kind === "topic" || alvo?.kind === "task" ? alvo.topicId : null
      if (!topicoAlvoId || topicoAlvoId === itemArrastado.topicId) return

      const indiceAtual = topicos.findIndex(
        (topico) => topico.id === itemArrastado.topicId
      )
      const indiceAlvo = topicos.findIndex((topico) => topico.id === topicoAlvoId)
      if (indiceAtual !== -1 && indiceAlvo !== -1) {
        onReorderTopicos(arrayMove(topicos, indiceAtual, indiceAlvo))
      }
      return
    }

    if (itemArrastado?.kind !== "task") return

    // Soltar sobre um tópico/tarefa move a tarefa; soltar na área vazia remove o vínculo.
    let novoTopicoId
    if (alvo?.kind === "topic" || alvo?.kind === "task") {
      novoTopicoId = alvo.topicId || ""
    } else if (alvo?.kind === "unassigned") {
      novoTopicoId = ""
    } else {
      return
    }

    if (itemArrastado.topicId !== novoTopicoId) {
      onMoveTask(itemArrastado.taskId, novoTopicoId)
    }
  }

  if (tarefas.length === 0 && topicos.length === 0) {
    return (
      <div className="mt-6">
        <TaskEmptyState />
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="mt-6">
        <div className="space-y-6 rounded-3xl border border-orange-200 bg-white p-8">
          {/* A lista externa controla a ordem dos tópicos; cada tópico controla suas tarefas. */}
          <SortableContext
            items={topicos.map((topico) => `topic:${topico.id}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-6">
              {topicos.map((topico) => (
                <SortableTopic key={topico.id} topic={topico}>
                  {renderizarTarefas(
                    tarefas.filter((tarefa) => tarefa.topicoId === topico.id),
                    topico.id
                  )}
                </SortableTopic>
              ))}
            </div>
          </SortableContext>

          {tarefasSemTopico.length > 0 && (
            <UnassignedDropZone>
              {renderizarTarefas(tarefasSemTopico, "")}
            </UnassignedDropZone>
          )}
        </div>
      </div>
    </DndContext>
  )
}

TaskList.propTypes = {
  tarefas: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      titulo: PropTypes.string.isRequired,
      descricao: PropTypes.string,
      data: PropTypes.string,
      topicoId: PropTypes.string,
      cor: PropTypes.string,
      concluida: PropTypes.bool,
    })
  ).isRequired,
  topicos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      nome: PropTypes.string.isRequired,
    })
  ).isRequired,
  onToggle: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onMoveTask: PropTypes.func.isRequired,
  onReorderTopicos: PropTypes.func.isRequired,
}

export default TaskList
