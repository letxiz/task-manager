import { useEffect, useState } from "react"

import TaskEmptyState from "../../components/layout/tasks/TaskEmptyState"
import TaskFormModal from "../../components/layout/tasks/TaskFormModal"
import TaskItem from "../../components/layout/tasks/TaskItem"
import TaskToolbar from "../../components/layout/tasks/TaskToolbar"

function Tasks() {
  const [modalAberto, setModalAberto] = useState(false)
  const [janelaExpandida, setJanelaExpandida] = useState(false)

  const [titulo, setTitulo] = useState("")
  const [descricao, setDescricao] = useState("")
  const [data, setData] = useState("")
  const [erroTitulo, setErroTitulo] = useState("")

  const [tarefas, setTarefas] = useState(() => {
    try {
      const salvas = localStorage.getItem("minhas-tarefas")
      return salvas ? JSON.parse(salvas) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem("minhas-tarefas", JSON.stringify(tarefas))
  }, [tarefas])

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
      concluida: false,
    }

    setTarefas((atuais) => [...atuais, novaTarefa])
    setTitulo("")
    setDescricao("")
    setData("")
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
    if (tarefas.length === 0) return

    const confirmou = window.confirm(
      "Tem certeza de que deseja excluir todas as tarefas?"
    )

    if (confirmou) {
      setTarefas([])
    }
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
        onCreate={() => {
          setErroTitulo("")
          setModalAberto(true)
        }}
      />

      {tarefas.length === 0 ? (
        <TaskEmptyState />
      ) : (
        <ul className="mt-6 space-y-3">
          {tarefas.map((tarefa) => (
            <TaskItem
              key={tarefa.id}
              task={tarefa}
              onToggle={alternarConclusao}
              onDelete={excluirTarefa}
            />
          ))}
        </ul>
      )}

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
    </>
  )
}

export default Tasks
