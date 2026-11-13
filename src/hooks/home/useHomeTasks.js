import { useCallback, useRef, useState } from "react"
import { useTaskData } from "../tasks/useTaskData"
import { useFormControls } from "../tasks/useFormControls"

export function useHomeTasks() {
  const dados = useTaskData()
  const formularioRef = useRef(null)
  const formulario = useFormControls(formularioRef)
  const [detalhesId, setDetalhesId] = useState(null)
  // Busca os detalhes na lista atual.
  const selecionada =
    dados.tarefas.find((tarefa) => tarefa.id === detalhesId) ?? null

  const verDetalhes = useCallback((tarefa) => setDetalhesId(tarefa.id), [])

  return {
    dados,
    formulario,
    formularioRef,
    verDetalhes,
    detalhes: {
      item: selecionada,
      kind: "task",
      topicName: dados.topicos.find(
        (topico) => topico.id === selecionada?.topicoId
      )?.nome,
      onClose: () => {
        setDetalhesId(null)
      },
      onEdit: () => {
        if (!selecionada) return
        setDetalhesId(null)
        formulario.editar(selecionada)
      },
    },
  }
}
