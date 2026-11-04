import { useState } from "react"
import { useNotification } from "../../contexts/NotificationContext"
import { TOPIC_COLORS, getTopicColor } from "../../constants/topicColors"
import { carregarTarefas } from "../../utils/taskStorage"

export function useTaskStore() {
  const notify = useNotification()
  const [armazenamento] = useState(() => carregarTarefas())
  const [tarefas, atualizarTarefas] = useState(armazenamento.tarefas)
  const [erroArmazenamento, setErroArmazenamento] = useState(armazenamento.erro)
  const [topicos, atualizarTopicos] = useState(() => {
    try {
      const salvos = JSON.parse(localStorage.getItem("meus-topicos") ?? "[]")
      if (!Array.isArray(salvos)) return []
      return salvos.filter((topico) => topico && typeof topico.id === "string" && typeof topico.nome === "string").map((topico, index) => ({ ...topico, cor: topico.cor ? getTopicColor(topico.cor).id : TOPIC_COLORS[index % TOPIC_COLORS.length].id }))
    } catch {
      return []
    }
  })

  // Avisa sucesso após salvar.
  function salvarLista(chave, proximos, atualizar, mensagem) {
    atualizar(proximos)
    try {
      localStorage.setItem(chave, JSON.stringify(proximos))
      setErroArmazenamento("")
    } catch {
      setErroArmazenamento("Não foi possível salvar neste navegador. As alterações podem ser perdidas ao sair da página.")
      return false
    }
    if (mensagem) notify(mensagem)
    return true
  }

  function setTarefas(atualizar, mensagem) {
    return salvarLista("minhas-tarefas", typeof atualizar === "function" ? atualizar(tarefas) : atualizar, atualizarTarefas, mensagem)
  }

  function setTopicos(atualizar, mensagem) {
    return salvarLista("meus-topicos", typeof atualizar === "function" ? atualizar(topicos) : atualizar, atualizarTopicos, mensagem)
  }

  function alternarConclusao(id) {
    setTarefas((atuais) =>
      atuais.map((tarefa) =>
        tarefa.id === id
          ? { ...tarefa, concluida: !tarefa.concluida }
          : tarefa
      )
    )
  }
  function excluirTarefa(id) {
    setTarefas((atuais) => atuais.filter((tarefa) => tarefa.id !== id), "Tarefa excluída.")
  }
  function moverTarefa(id, novoTopicoId) {
    // String vazia remove o vínculo.
    setTarefas((atuais) =>
      atuais.map((tarefa) =>
        tarefa.id === id ? { ...tarefa, topicoId: novoTopicoId } : tarefa
      )
    )
  }
  function reordenarTarefas(idsOrdenados) {
    setTarefas((atuais) => {
      const idsDoGrupo = new Set(idsOrdenados)
      const tarefasPorId = new Map(atuais.map((tarefa) => [tarefa.id, tarefa]))
      let indiceOrdenado = 0

      // Preserva a ordem dos outros grupos.
      return atuais.map((tarefa) => {
        if (!idsDoGrupo.has(tarefa.id)) return tarefa
        const tarefaOrdenada = tarefasPorId.get(idsOrdenados[indiceOrdenado])
        indiceOrdenado += 1
        return tarefaOrdenada
      })
    })
  }

  // Exclui o tópico, mantém as tarefas.
  function excluirTopico(id) {
    const tarefasSalvas = setTarefas((atuais) => atuais.map((tarefa) =>
      tarefa.topicoId === id ? { ...tarefa, topicoId: "" } : tarefa
    ))
    const topicosSalvos = setTopicos((atuais) => atuais.filter((topico) => topico.id !== id))
    return tarefasSalvas && topicosSalvos
  }

  return {
    tarefas, topicos, erroArmazenamento, setTarefas, setTopicos,
    alternarConclusao, excluirTarefa, moverTarefa, reordenarTarefas, excluirTopico,
  }
}
