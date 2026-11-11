import { useState } from "react"
import { TOPIC_COLORS, getTopicColor } from "../../constants/topicColors"
import { useNotification } from "../../contexts/NotificationContext"
import { gerarIdSeguro } from "../../utils/generateId"

export function useTopicForm({ topicos, setTopicos, setTarefas }) {
  const notify = useNotification()
  const [editandoSemTopico, setEditandoSemTopico] = useState(false)
  const [topicoEditando, setTopicoEditando] = useState(null)
  const [modalTopicoAberto, setModalTopicoAberto] = useState(false)
  const [corTopico, setCorTopico] = useState(TOPIC_COLORS[0].id)
  const [nomeTopico, setNomeTopico] = useState("")
  const [erroTopico, setErroTopico] = useState("")
  const [erroCriacaoTopico, setErroCriacaoTopico] = useState("")
  function editarTopico(topico) {
    setEditandoSemTopico(false)
    setTopicoEditando(topico.id)
    setNomeTopico(topico.nome)
    setCorTopico(getTopicColor(topico.cor).id)
    setErroTopico("")
    setErroCriacaoTopico("")
    setModalTopicoAberto(true)
  }
  function cancelarTopico() {
    setModalTopicoAberto(false)
    setTopicoEditando(null)
    setEditandoSemTopico(false)
  }
  function criarTopico(event) {
    event.preventDefault()
    const nome = nomeTopico.trim()

    if (!nome) {
      setErroTopico("O nome do tópico é obrigatório.")
      return
    }

    // Evita nomes duplicados.
    const nomeJaExiste = topicos.some(
      (topico) => topico.id !== topicoEditando && topico.nome.toLocaleLowerCase() === nome.toLocaleLowerCase()
    )
    if (nomeJaExiste) {
      setErroTopico("Já existe um tópico com esse nome.")
      return
    }

    if (topicoEditando) {
      setTopicos((atuais) => atuais.map((topico) => topico.id === topicoEditando
        ? { ...topico, nome, cor: getTopicColor(corTopico).id }
        : topico), "Tópico atualizado com sucesso.")
      setTopicoEditando(null)
      setModalTopicoAberto(false)
      return
    }

    let id
    try {
      id = gerarIdSeguro()
    } catch {
      setErroCriacaoTopico(
        "Este navegador não conseguiu gerar um identificador seguro. Tente novamente em um navegador atualizado."
      )
      return
    }

    const salvo = setTopicos((atuais) => [...atuais, { id, nome, cor: getTopicColor(corTopico).id }], editandoSemTopico ? undefined : "Tópico criado com sucesso.")
    if (!salvo) return
    if (editandoSemTopico) {
      const tarefasSalvas = setTarefas((atuais) => atuais.map((tarefa) =>
        !tarefa.topicoId || !topicos.some((topico) => topico.id === tarefa.topicoId)
          ? { ...tarefa, topicoId: id }
          : tarefa))
      if (tarefasSalvas) notify("Tópico atualizado. Suas tarefas foram mantidas no grupo.")
    }
    setEditandoSemTopico(false)
    setNomeTopico("")
    setErroTopico("")
    setErroCriacaoTopico("")
    setModalTopicoAberto(false)
  }

  function abrir() {
    setEditandoSemTopico(false)
    setTopicoEditando(null)
    setNomeTopico("")
    setCorTopico(TOPIC_COLORS[0].id)
    setErroTopico("")
    setErroCriacaoTopico("")
    setModalTopicoAberto(true)
  }

  return {
    abrir, editar: editarTopico,
    editarSemTopico: () => {
      abrir()
      setNomeTopico("Sem tópico")
      setEditandoSemTopico(true)
    },
    props: {
      editing: Boolean(topicoEditando) || editandoSemTopico, open: modalTopicoAberto,
      name: nomeTopico, color: corTopico, onColorChange: setCorTopico,
      error: erroTopico, creationError: erroCriacaoTopico,
      onNameChange: (nome) => {
        setNomeTopico(nome)
        if (erroTopico) setErroTopico("")
        if (erroCriacaoTopico) setErroCriacaoTopico("")
      },
      onClose: cancelarTopico, onSubmit: criarTopico,
    },
  }
}
