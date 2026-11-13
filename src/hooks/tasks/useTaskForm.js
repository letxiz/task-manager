import { useState } from "react"

export function useTaskForm({ topicos, criarTarefa: cadastrarTarefa, editarTarefa: atualizarTarefa }) {
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
  function fecharModal() {
    setErroTitulo("")
    setErroCriacaoTarefa("")
    setJanelaExpandida(false)
    setModalAberto(false)
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

    const campos = { titulo, descricao, data, topicoId, cor }
    const resultado = tarefaEditando ? atualizarTarefa(tarefaEditando, campos) : cadastrarTarefa(campos)
    if (resultado.erro) {
      if (resultado.campo === "titulo") setErroTitulo(resultado.erro)
      else setErroCriacaoTarefa(resultado.erro)
      return
    }
    if (tarefaEditando) {
      fecharModal()
      return
    }

    setTitulo("")
    setDescricao("")
    setData("")
    setTopicoId("")
    setCor("#ef4444")
    setErroTitulo("")
    fecharModal()
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
