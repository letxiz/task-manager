import { useState } from "react"
import { TOPIC_COLORS, getTopicColor } from "../../constants/topicColors.js"

export function useTopicForm({ criarTopico: cadastrarTopico, editarTopico: atualizarTopico, criarTopicoComTarefasSemTopico }) {
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
    const campos = { nome: nomeTopico, cor: corTopico }
    const resultado = topicoEditando
      ? atualizarTopico(topicoEditando, campos)
      : editandoSemTopico ? criarTopicoComTarefasSemTopico(campos) : cadastrarTopico(campos)
    if (resultado.erro) {
      if (resultado.campo === "nome") setErroTopico(resultado.erro)
      else setErroCriacaoTopico(resultado.erro)
      return
    }
    if (topicoEditando) {
      setTopicoEditando(null)
      setModalTopicoAberto(false)
      return
    }
    if (!resultado.salvo) return
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
