import { getTopicColor } from "../../constants/topicColors"
import { useNotification } from "../../contexts/NotificationContext"
import PropTypes from "prop-types"
import { GripVertical, Trash2 } from "lucide-react"
import { useState } from "react"
import {
  closestCenter,
  DragOverlay,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  pointerWithin,
  TouchSensor,
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
import TaskItem, { TaskItemPreview } from "./TaskItem"
import Tooltip from "./Tooltip"
import { useTooltip } from "./useTooltip"

function detectarColisao(args) {
  // Prioriza tarefas sob o ponteiro.
  if (args.active.data.current?.kind === "task") {
    const sobreposicoes = pointerWithin(args)
      .filter((colisao) => colisao.id !== args.active.id)
      .map((colisao) => ({
        colisao,
        recipiente: args.droppableContainers.find(
          (item) => item.id === colisao.id
        ),
      }))
      .filter((item) => item.recipiente)
    const tarefaAlvo = sobreposicoes.find(
      (item) => item.recipiente.data.current?.kind === "task"
    )
    if (tarefaAlvo) return [tarefaAlvo.colisao]

    const areaAlvo = sobreposicoes.find((item) =>
      ["topic", "unassigned"].includes(item.recipiente.data.current?.kind)
    )
    const recipienteAlvo = areaAlvo?.recipiente
    const areaTopicoId =
      recipienteAlvo?.data.current?.kind === "unassigned"
        ? ""
        : recipienteAlvo?.data.current?.topicId
    if (areaAlvo && areaTopicoId === args.active.data.current?.topicId) {
      // Usa a tarefa mais próxima.
      const tarefasDoGrupo = args.droppableContainers.filter(
        (item) =>
          item.id !== args.active.id &&
          item.data.current?.kind === "task" &&
          item.data.current?.topicId === args.active.data.current?.topicId
      )
      const tarefaMaisProxima = closestCenter({
        ...args,
        droppableContainers: tarefasDoGrupo,
      })[0]
      if (tarefaMaisProxima) return [tarefaMaisProxima]
    }

    if (areaAlvo) return [areaAlvo.colisao]
  }

  return closestCenter(args)
}

function SortableTopic({ topic, children, onDeleteTopic, onEditTopic }) {
  const color = getTopicColor(topic.cor)
  const dragTooltip = useTooltip()
  const deleteTooltip = useTooltip()
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
        <Tooltip
          id={deleteTooltip.id}
          open={deleteTooltip.open}
          wrapperProps={deleteTooltip.wrapperProps}
          content="Excluir tópico"
          className="shrink-0"
        >
          <button
            {...deleteTooltip.triggerProps}
            type="button"
            onClick={(event) => {
              deleteTooltip.triggerProps.onClick(event)
              onDeleteTopic(topic)
            }}
            aria-label={`Excluir tópico ${topic.nome}`}
            className="rounded-lg p-2 text-muted hover:text-danger focus-visible:outline-2 focus-visible:outline-danger"
          >
            <Trash2 size={18} aria-hidden="true" />
          </button>
        </Tooltip>
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

function TaskList({
  tarefas,
  topicos,
  onToggle,
  onDelete,
  onMoveTask,
  onReorderTasks,
  onReorderTopicos,
  onDeleteTopic,
  onEditTask,
  onEditTopic,
}) {
  const notify = useNotification()
  const [previaArraste, setPreviaArraste] = useState(null)

  // Pressão longa evita arraste ao rolar.
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 300, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // Tópico ausente vira Sem tópico.
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
            onEdit={onEditTask}
          />
          ))}
        </ul>
      </SortableContext>
    )
  }

  function handleDragEnd({ active, over }) {
    setPreviaArraste(null)
    if (!over) return

    const itemArrastado = active.data.current
    const alvo = over.data.current

    // Reordena entre tópicos válidos.
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

    // Reordena apenas o grupo atual.
    if (alvo?.kind === "task" && itemArrastado.topicId === alvo.topicId) {
      const tarefasDoGrupo =
        itemArrastado.topicId === ""
          ? tarefasSemTopico
          : tarefas.filter((tarefa) => tarefa.topicoId === itemArrastado.topicId)
      const indiceAtual = tarefasDoGrupo.findIndex(
        (tarefa) => tarefa.id === itemArrastado.taskId
      )
      const indiceAlvo = tarefasDoGrupo.findIndex(
        (tarefa) => tarefa.id === alvo.taskId
      )

      if (indiceAtual !== -1 && indiceAlvo !== -1 && indiceAtual !== indiceAlvo) {
        const tarefasReordenadas = arrayMove(
          tarefasDoGrupo,
          indiceAtual,
          indiceAlvo
        )
        onReorderTasks(tarefasReordenadas.map((tarefa) => tarefa.id))
      }
      return
    }

    // Move ou desvincula a tarefa.
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

  function handleDragStart({ active }) {
    const tarefaAtiva = active.data.current
    const dimensoesIniciais = active.rect.current.initial

    if (tarefaAtiva?.kind !== "task" || !dimensoesIniciais) {
      setPreviaArraste(null)
      return
    }

    const tarefa = tarefas.find((item) => item.id === tarefaAtiva.taskId)
    setPreviaArraste(
      tarefa
        ? {
            tarefa,
            width: dimensoesIniciais.width,
            height: dimensoesIniciais.height,
          }
        : null
    )
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
      collisionDetection={detectarColisao}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => {
        setPreviaArraste(null)
        notify("Movimentação cancelada.", "info")
      }}
    >
      <div className="mt-6">
        <div className="space-y-6 rounded-3xl border border-orange-200 bg-white p-8">
          <SortableContext
            items={topicos.map((topico) => `topic:${topico.id}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-6">
              {topicos.map((topico) => (
                <SortableTopic key={topico.id} topic={topico} onDeleteTopic={onDeleteTopic} onEditTopic={onEditTopic}>
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
      <DragOverlay style={{ zIndex: 50 }}>
        {previaArraste && (
          <TaskItemPreview
            task={previaArraste.tarefa}
            width={previaArraste.width}
            height={previaArraste.height}
          />
        )}
      </DragOverlay>
    </DndContext>
  )
}

TaskList.propTypes = {
  onEditTask: PropTypes.func.isRequired,
  onEditTopic: PropTypes.func.isRequired,
  onDeleteTopic: PropTypes.func.isRequired,
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
  onReorderTasks: PropTypes.func.isRequired,
  onReorderTopicos: PropTypes.func.isRequired,
}

export default TaskList
