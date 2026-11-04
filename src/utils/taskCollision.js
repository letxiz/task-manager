import { closestCenter, pointerWithin } from "@dnd-kit/core"

export function detectarColisao(args) {
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
