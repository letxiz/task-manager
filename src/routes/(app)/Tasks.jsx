import ConfirmDialog from "../../components/ui/ConfirmDialog"
import { useNotification } from "../../contexts/NotificationContext"
import { useState } from "react"

import { carregarTarefas } from "../../utils/taskStorage"

import TaskEmptyState from "../../components/layout/tasks/TaskEmptyState"
import TaskFormModal from "../../components/layout/tasks/TaskFormModal"
import TaskItem from "../../components/layout/tasks/TaskItem"
import TaskToolbar from "../../components/layout/tasks/TaskToolbar"

function Tasks() {
  const notify = useNotification()
  const [confirmacaoAberta, setConfirmacaoAberta] = useState(false)
  const [modalAberto, setModalAberto] = useState(false)
  const [janelaExpandida, setJanelaExpandida] = useState(false)

  const [titulo, setTitulo] = useState("")
  const [descricao, setDescricao] = useState("")
  const [data, setData] = useState("")
  const [erroTitulo, setErroTitulo] = useState("")

  const [armazenamento] = useState(() => carregarTarefas())
  const [tarefas, atualizarTarefas] = useState(armazenamento.tarefas)
  const [erroArmazenamento, setErroArmazenamento] = useState(armazenamento.erro)

  function setTarefas(atualizar, mensagem) {
    const proximas = atualizar(tarefas)
    atualizarTarefas(proximas)
    try {
      localStorage.setItem("minhas-tarefas", JSON.stringify(proximas))
      setErroArmazenamento("")
      if (mensagem) notify(mensagem)
    } catch {
      setErroArmazenamento(
        "Não foi possível salvar as tarefas neste navegador. As alterações podem ser perdidas ao sair da página."
      )
    }
  }

  function fecharModal(notificar = true) {
    setErroTitulo("")
    setJanelaExpandida(false)
    setModalAberto(false)
    if (notificar) notify("Cadastro cancelado. O rascunho foi mantido.", "info")
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

    setTarefas((atuais) => [...atuais, novaTarefa], "Tarefa cadastrada com sucesso.")
    setTitulo("")
    setDescricao("")
    setData("")
    setErroTitulo("")
    fecharModal(false)
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

  function limparTarefas() {
    if (tarefas.length === 0) return

    setConfirmacaoAberta(true)
  }

  function confirmarLimpeza() {
    setTarefas(() => [], "Todas as tarefas foram excluídas.")
    setConfirmacaoAberta(false)
  }

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Minhas Tarefas
      </h1>

      <p className="mt-2 text-slate-600">Organize aqui o que precisa fazer.</p>

      {erroArmazenamento && (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-800">
          {erroArmazenamento}
        </p>
      )}

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

      <ConfirmDialog
        open={confirmacaoAberta}
        title="Excluir todas as tarefas?"
        message="Todas as tarefas serão removidas. Essa ação não pode ser desfeita."
        onCancel={() => {
          setConfirmacaoAberta(false)
          notify("Exclusão cancelada. Suas tarefas foram mantidas.", "info")
        }}
        onConfirm={confirmarLimpeza}
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
    </>
  )
}

export default Tasks
