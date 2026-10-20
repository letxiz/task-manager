import { useState } from "react"
import { useNotification } from "../../contexts/NotificationContext"

export function useTaskDialogs(dados, formularioTarefa, formularioTopico) {
  const notify = useNotification()
  const [detalhes, setDetalhes] = useState(null)
  const [topicoParaExcluir, setTopicoParaExcluir] = useState(null)
  const [confirmacaoAberta, setConfirmacaoAberta] = useState(false)
  const { tarefas, topicos, setTarefas, setTopicos, excluirTopico } = dados

  function limpar() {
    if (tarefas.length || topicos.length) setConfirmacaoAberta(true)
  }

  return {
    limpar,
    verTarefa: (item) => setDetalhes({ kind: "task", item }),
    verTopico: (item) => setDetalhes({ kind: "topic", item }),
    solicitarExclusaoTopico: setTopicoParaExcluir,
    detalhes: {
      item: detalhes?.item ?? null,
      kind: detalhes?.kind,
      topicName: topicos.find((topico) => topico.id === detalhes?.item.topicoId)?.nome,
      taskCount: tarefas.filter((tarefa) => tarefa.topicoId === detalhes?.item.id).length,
      onClose: () => {
        setDetalhes(null)
        notify("Visualização de detalhes cancelada.", "info")
      },
      onEdit: () => {
        if (!detalhes) return
        setDetalhes(null)
        if (detalhes.kind === "task") formularioTarefa.editar(detalhes.item)
        else formularioTopico.editar(detalhes.item)
      },
    },
    exclusaoTopico: {
      open: Boolean(topicoParaExcluir),
      title: `Excluir o tópico “${topicoParaExcluir?.nome ?? ""}”?`,
      message: "O tópico será excluído. Suas tarefas serão mantidas na seção Sem tópico.",
      confirmLabel: "Excluir tópico",
      onCancel: () => {
        setTopicoParaExcluir(null)
        notify("Exclusão do tópico cancelada.", "info")
      },
      onConfirm: () => {
        if (!topicoParaExcluir) return
        const salvo = excluirTopico(topicoParaExcluir.id)
        formularioTarefa.removerTopico(topicoParaExcluir.id)
        setTopicoParaExcluir(null)
        if (salvo) notify("Tópico excluído. As tarefas foram mantidas em Sem tópico.")
      },
    },
    limpeza: {
      open: confirmacaoAberta,
      title: "Excluir todas as tarefas e tópicos?",
      message: "Todas as tarefas e tópicos serão removidos. Essa ação não pode ser desfeita.",
      onCancel: () => {
        setConfirmacaoAberta(false)
        notify("Exclusão cancelada. Suas tarefas foram mantidas.", "info")
      },
      onConfirm: () => {
        const tarefasSalvas = setTarefas([])
        const topicosSalvos = setTopicos([])
        setConfirmacaoAberta(false)
        if (tarefasSalvas && topicosSalvos) notify("Todas as tarefas e tópicos foram excluídos.")
      },
    },
  }
}
