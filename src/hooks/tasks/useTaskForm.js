import { useState } from "react"
import { useNotification } from "../../contexts/NotificationContext"
import { gerarIdSeguro } from "../../utils/generateId"

export function useTaskForm({ topicos, setTarefas }) {
  const notify = useNotification()
  const [tarefaEditando, setTarefaEditando] = useState(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [janelaExpandida, setJanelaExpandida] = useState(false)
  const [titulo, setTitulo] = useState("")
  const [descricao, setDescricao] = useState("")
  const [data, setData] = useState("")
  const [erroTitulo, setErroTitulo] = useState("")
  const [erroCriacaoTarefa, setErroCriacaoTarefa] = useState("")
  const [topicoId, setTopicoId] = useState("")
  const [cor, setCor] = useState("#ef4444")
  function fecharModal(notificar = true) {
    setErroTitulo("")
    setErroCriacaoTarefa("")
    setJanelaExpandida(false)
    setModalAberto(false)
    if (notificar) notify(tarefaEditando ? "Edição da tarefa cancelada. Nenhuma alteração foi aplicada." : "Cadastro cancelado. O rascunho foi mantido.", "info")
    if (tarefaEditando) {
      setTitulo("")
      setDescricao("")
      setData("")
      setTopicoId("")
      setCor("#ef4444")
    }
    setTarefaEditando(null)
  }
  function editarTarefa(tarefa) {
    setTarefaEditando(tarefa.id)
    setTitulo(tarefa.titulo)
    setDescricao(tarefa.descricao ?? "")
    setData(tarefa.data ?? "")
    setTopicoId(tarefa.topicoId ?? "")
    setCor(tarefa.cor ?? "#ef4444")
    setErroTitulo("")
    setErroCriacaoTarefa("")
    setJanelaExpandida(false)
    setModalAberto(true)
  }
  function criarTarefa(event) {
    event.preventDefault()

    const tituloValido = titulo.trim()

    if (!tituloValido) {
      setErroTitulo("O título da tarefa é obrigatório.")
      return
    }

    // Preserva ID, status e ordem.
    if (tarefaEditando) {
      setTarefas((atuais) => atuais.map((tarefa) => tarefa.id === tarefaEditando
        ? { ...tarefa, titulo: tituloValido, descricao: descricao.trim(), data, topicoId }
        : tarefa), "Tarefa atualizada com sucesso.")
      fecharModal(false)
      return
    }

    let id
    try {
      id = gerarIdSeguro()
    } catch {
      setErroCriacaoTarefa(
        "Este navegador não conseguiu gerar um identificador seguro. Tente novamente em um navegador atualizado."
      )
      return
    }

    const novaTarefa = {
      id,
      titulo: tituloValido,
      descricao: descricao.trim(),
      data,
      topicoId,
      cor,
      concluida: false,
    }

    setTarefas((atuais) => [...atuais, novaTarefa], "Tarefa cadastrada com sucesso.")
    setTitulo("")
    setDescricao("")
    setData("")
    setTopicoId("")
    setCor("#ef4444")
    setErroTitulo("")
    fecharModal(false)
  }

  function abrir(topicId) {
    // Preenche o tópico ao usar “Adicionar tarefa” no grupo.
    if (typeof topicId === "string") setTopicoId(topicId)
    setTarefaEditando(null)
    setErroTitulo("")
    setErroCriacaoTarefa("")
    setModalAberto(true)
  }

  function removerTopico(id) {
    if (topicoId === id) setTopicoId("")
  }

  return {
    abrir, editar: editarTarefa, removerTopico,
    props: {
      topicos, topicoId, onTopicChange: setTopicoId,
      editing: Boolean(tarefaEditando), open: modalAberto,
      janelaExpandida, titulo, descricao, data,
      erroTitulo, erroCriacao: erroCriacaoTarefa,
      onClose: fecharModal, onSubmit: criarTarefa,
      onTitleChange: (novoTitulo) => {
        setTitulo(novoTitulo)
        if (erroTitulo && novoTitulo.trim()) setErroTitulo("")
      },
      onDescriptionChange: setDescricao, onDateChange: setData,
      onExpand: () => setJanelaExpandida(true),
      onContract: () => setJanelaExpandida(false),
    },
  }
}
