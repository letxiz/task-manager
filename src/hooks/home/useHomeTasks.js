import { useState } from "react"
import { useNotification } from "../../contexts/NotificationContext"
import { useTaskData } from "../tasks/useTaskData"
import { useTaskForm } from "../tasks/useTaskForm"

export function useHomeTasks() {
  const dados = useTaskData()
  const formulario = useTaskForm(dados)
  const notify = useNotification()
  const [detalhesId, setDetalhesId] = useState(null)
  // Busca os detalhes na lista atual.
  const selecionada = dados.tarefas.find((tarefa) => tarefa.id === detalhesId) ?? null

  return {
    dados, formulario,
    verDetalhes: (tarefa) => setDetalhesId(tarefa.id),
    detalhes: {
      item: selecionada, kind: "task",
      topicName: dados.topicos.find((topico) => topico.id === selecionada?.topicoId)?.nome,
      onClose: () => {
        setDetalhesId(null)
        notify("Visualização de detalhes cancelada.", "info")
      },
      onEdit: () => {
        if (!selecionada) return
        setDetalhesId(null)
        formulario.editar(selecionada)
      },
    },
  }
}
