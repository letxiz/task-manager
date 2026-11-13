import { useMemo } from "react"
import { agruparTarefasVisiveis } from "../../../utils/taskGroups.js"
import PropTypes from "prop-types"
import { DndContext, DragOverlay } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useTaskDrag } from "../../../hooks/tasks/useTaskDrag"
import TaskEmptyState from "./TaskEmptyState"
import TaskGroup from "./TaskGroup"
import TaskItemPreview from "./TaskItemPreview"
import SortableTopic from "./SortableTopic"
import UnassignedDropZone from "./UnassignedDropZone"

function TaskList({
  tarefas,
  tarefasVisiveis = tarefas,
  filtrando = false,
  topicos,
  onToggle,
  onDelete,
  onMoveTask,
  onReorderTasks,
  onReorderTopicos,
  onDeleteTopic,
  onEditTask,
  onEditTopic,
  onEditUnassigned,
}) {
  // Mantém a lista completa como base para o arraste.
  const { indiceTarefas, previaArraste, dragProps } = useTaskDrag({
    tarefas, topicos, onMoveTask, onReorderTasks, onReorderTopicos,
  })

  const { porTopico, tarefasSemTopico } = useMemo(() =>
    tarefasVisiveis === tarefas ? indiceTarefas : agruparTarefasVisiveis(indiceTarefas, tarefasVisiveis),
  [indiceTarefas, tarefas, tarefasVisiveis])

  if (tarefas.length === 0 && topicos.length === 0) {
    return (
      <div className="mt-6">
        <TaskEmptyState />
      </div>
    )
  }

  return (
    <DndContext {...dragProps}>
      <div>
        {filtrando && tarefasVisiveis.length === 0 && <p role="status" className="mb-5 text-sm text-muted">Nenhuma tarefa encontrada.</p>}
        <div className="space-y-5">
          <SortableContext
            items={topicos.map((topico) => `topic:${topico.id}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-6">
              {/* Mostra os tópicos que contêm resultados do filtro. */}
              {topicos.filter((topico) => !filtrando || porTopico.has(topico.id) && porTopico.get(topico.id).length > 0).map((topico) => (
                <SortableTopic key={topico.id} topic={topico} onDeleteTopic={onDeleteTopic} onEditTopic={onEditTopic}>
                  <TaskGroup
                    tarefas={porTopico.get(topico.id) ?? []}
                    topicId={topico.id}
                    onToggle={onToggle}
                    onDelete={onDelete}
                    onEdit={onEditTask}
                  />
                </SortableTopic>
              ))}
            </div>
          </SortableContext>

          {tarefasSemTopico.length > 0 && (
            <UnassignedDropZone onEdit={onEditUnassigned}>
              <TaskGroup tarefas={tarefasSemTopico} topicId="" onToggle={onToggle} onDelete={onDelete} onEdit={onEditTask} />
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
  tarefasVisiveis: PropTypes.array,
  filtrando: PropTypes.bool,
  onEditTask: PropTypes.func.isRequired,
  onEditTopic: PropTypes.func.isRequired,
  onEditUnassigned: PropTypes.func.isRequired,
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
