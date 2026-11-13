import { useMemo, useState } from "react"
import { KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { detectarColisao } from "../../utils/taskCollision"
import { indexarTarefas } from "../../utils/taskGroups.js"

export function useTaskDrag({ tarefas, topicos, onMoveTask, onReorderTasks, onReorderTopicos }) {
  const [previaArraste, setPreviaArraste] = useState(null)

  // Pressão longa evita arraste ao rolar.
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 300, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const indiceTarefas = useMemo(() => indexarTarefas(tarefas, topicos), [tarefas, topicos])
  const { tarefasSemTopico, porTopico, tarefasPorId, indicesTopicos } = indiceTarefas

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

      const indiceAtual = indicesTopicos.get(itemArrastado.topicId)
      const indiceAlvo = indicesTopicos.get(topicoAlvoId)
      if (indiceAtual !== undefined && indiceAlvo !== undefined) {
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
          : porTopico.get(itemArrastado.topicId) ?? []
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

    const tarefa = tarefasPorId.get(tarefaAtiva.taskId)
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

  return {
    indiceTarefas,
    tarefasSemTopico,
    previaArraste,
    dragProps: {
      sensors,
      collisionDetection: detectarColisao,
      onDragStart: handleDragStart,
      onDragEnd: handleDragEnd,
      onDragCancel: () => {
        setPreviaArraste(null)
      },
    },
  }
}
