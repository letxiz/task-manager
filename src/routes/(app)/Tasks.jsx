import { useEffect, useState } from "react"

import TaskFormModal from "../../components/tasks/TaskFormModal"
import TaskList from "../../components/tasks/TaskList"
import TaskToolbar from "../../components/tasks/TaskToolbar"
import TaskTopicModal from "../../components/tasks/TaskTopicModal"

function Tasks() {
  const [modalAberto, setModalAberto] = useState(false)
  const [modalTopicoAberto, setModalTopicoAberto] = useState(false)
  const [janelaExpandida, setJanelaExpandida] = useState(false)

  const [titulo, setTitulo] = useState("")
  const [descricao, setDescricao] = useState("")
  const [data, setData] = useState("")
  const [erroTitulo, setErroTitulo] = useState("")
  const [topicoId, setTopicoId] = useState("")
  const [cor, setCor] = useState("#ef4444")
  const [nomeTopico, setNomeTopico] = useState("")
  const [erroTopico, setErroTopico] = useState("")

  const [tarefas, setTarefas] = useState(() => {
    try {
      const salvas = localStorage.getItem("minhas-tarefas")
      return salvas ? JSON.parse(salvas) : []
    } catch {
      return []
    }
  })
  const [topicos, setTopicos] = useState(() => {
    try {
      const salvos = localStorage.getItem("meus-topicos")
      return salvos ? JSON.parse(salvos) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem("minhas-tarefas", JSON.stringify(tarefas))
  }, [tarefas])

  useEffect(() => {
    localStorage.setItem("meus-topicos", JSON.stringify(topicos))
  }, [topicos])

  function fecharModal() {
    setErroTitulo("")
    setJanelaExpandida(false)
    setModalAberto(false)
  }

  function criarTarefa(event) {
    event.preventDefault()

    const tituloValido = titulo.trim()

    if (!tituloValido) {
      setErroTitulo("O título da tarefa é obrigatório.")
      return
    }

    const novaTarefa = {
      id: crypto.randomUUID(),
      titulo: tituloValido,
      descricao: descricao.trim(),
      data,
      topicoId,
      cor,
      concluida: false,
    }

    setTarefas((atuais) => [...atuais, novaTarefa])
    setTitulo("")
    setDescricao("")
    setData("")
    setTopicoId("")
    setCor("#ef4444")
    setErroTitulo("")
    setModalAberto(false)
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
    setTarefas((atuais) => atuais.filter((tarefa) => tarefa.id !== id))
  }

  function limparTarefas() {
    if (tarefas.length === 0 && topicos.length === 0) return

    const confirmou = window.confirm(
      "Tem certeza de que deseja excluir todas as tarefas e tópicos?"
    )

    if (confirmou) {
      setTarefas([])
      setTopicos([])
    }
  }

  function criarTopico(event) {
    event.preventDefault()
    const nome = nomeTopico.trim()

    if (!nome) {
      setErroTopico("O nome do tópico é obrigatório.")
      return
    }

    const nomeJaExiste = topicos.some(
      (topico) => topico.nome.toLocaleLowerCase() === nome.toLocaleLowerCase()
    )
    if (nomeJaExiste) {
      setErroTopico("Já existe um tópico com esse nome.")
      return
    }

    setTopicos((atuais) => [...atuais, { id: crypto.randomUUID(), nome }])
    setNomeTopico("")
    setErroTopico("")
    setModalTopicoAberto(false)
  }

  function moverTarefa(id, novoTopicoId) {
    setTarefas((atuais) =>
      atuais.map((tarefa) =>
        tarefa.id === id ? { ...tarefa, topicoId: novoTopicoId } : tarefa
      )
    )
  }

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Minhas Tarefas
      </h1>

      <p className="mt-2 text-slate-600">Organize aqui o que precisa fazer.</p>

      <TaskToolbar
        taskCount={tarefas.length}
        onClear={limparTarefas}
        onCreateTask={() => {
          setErroTitulo("")
          setModalAberto(true)
        }}
        onCreateTopic={() => {
          setNomeTopico("")
          setErroTopico("")
          setModalTopicoAberto(true)
        }}
      />

      <TaskList
        tarefas={tarefas}
        topicos={topicos}
        onToggle={alternarConclusao}
        onDelete={excluirTarefa}
        onMoveTask={moverTarefa}
        onReorderTopicos={setTopicos}
      />

      <TaskFormModal
        open={modalAberto}
        janelaExpandida={janelaExpandida}
        titulo={titulo}
        descricao={descricao}
        data={data}
        erroTitulo={erroTitulo}
        onClose={fecharModal}
        onSubmit={criarTarefa}
        onTitleChange={(novoTitulo) => {
          setTitulo(novoTitulo)
          if (erroTitulo && novoTitulo.trim()) {
            setErroTitulo("")
          }
        }}
        onDescriptionChange={setDescricao}
        onDateChange={setData}
        onExpand={() => setJanelaExpandida(true)}
        onContract={() => setJanelaExpandida(false)}
      />

      <TaskTopicModal
        open={modalTopicoAberto}
        name={nomeTopico}
        error={erroTopico}
        onNameChange={(nome) => {
          setNomeTopico(nome)
          if (erroTopico) setErroTopico("")
        }}
        onClose={() => setModalTopicoAberto(false)}
        onSubmit={criarTopico}
      />
    </>
  )
}

export default Tasks
