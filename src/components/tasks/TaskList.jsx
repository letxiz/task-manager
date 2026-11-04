import PropTypes from "prop-types"
import { DndContext, DragOverlay } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useTaskDrag } from "../../hooks/tasks/useTaskDrag"
import TaskEmptyState from "./TaskEmptyState"
import TaskGroup from "./TaskGroup"
import TaskItemPreview from "./TaskItemPreview"
import SortableTopic from "./SortableTopic"
import UnassignedDropZone from "./UnassignedDropZone"

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
  const { tarefasSemTopico, previaArraste, dragProps } = useTaskDrag({
    tarefas, topicos, onMoveTask, onReorderTasks, onReorderTopicos,
  })

  if (tarefas.length === 0 && topicos.length === 0) {
    return (
      <div className="mt-6">
        <TaskEmptyState />
      </div>
    )
  }

  return (
    <DndContext {...dragProps}>
      <div className="mt-6">
        <div className="space-y-6 rounded-3xl border border-orange-200 bg-white p-8">
          <SortableContext
            items={topicos.map((topico) => `topic:${topico.id}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-6">
              {topicos.map((topico) => (
                <SortableTopic key={topico.id} topic={topico} onDeleteTopic={onDeleteTopic} onEditTopic={onEditTopic}>
                  <TaskGroup
                    tarefas={tarefas.filter((tarefa) => tarefa.topicoId === topico.id)}
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
            <UnassignedDropZone>
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
