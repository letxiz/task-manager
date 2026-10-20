import ConfirmDialog from "../../components/ui/ConfirmDialog"
import { useNotification } from "../../contexts/NotificationContext"
import { carregarTarefas } from "../../utils/taskStorage"
import { useState } from "react"

import TaskFormModal from "../../components/tasks/TaskFormModal"
import TaskList from "../../components/tasks/TaskList"
import TaskToolbar from "../../components/tasks/TaskToolbar"
import TaskTopicModal from "../../components/tasks/TaskTopicModal"

function gerarIdSeguro() {
  const cryptoApi = globalThis.crypto

  if (typeof cryptoApi?.randomUUID === "function") {
    return cryptoApi.randomUUID()
  }

  if (typeof cryptoApi?.getRandomValues !== "function") {
    throw new Error("O navegador não oferece um gerador de IDs seguro.")
  }

  const bytes = cryptoApi.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hexadecimal = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("")

  return `${hexadecimal.slice(0, 8)}-${hexadecimal.slice(8, 12)}-${hexadecimal.slice(12, 16)}-${hexadecimal.slice(16, 20)}-${hexadecimal.slice(20)}`
}

function Tasks() {
  const notify = useNotification()
  const [confirmacaoAberta, setConfirmacaoAberta] = useState(false)
  // Estados dos modais e do formulário ficam na página, que coordena os componentes.
  const [modalAberto, setModalAberto] = useState(false)
  const [modalTopicoAberto, setModalTopicoAberto] = useState(false)
  const [janelaExpandida, setJanelaExpandida] = useState(false)

  const [titulo, setTitulo] = useState("")
  const [descricao, setDescricao] = useState("")
  const [data, setData] = useState("")
  const [erroTitulo, setErroTitulo] = useState("")
  const [erroCriacaoTarefa, setErroCriacaoTarefa] = useState("")
  const [topicoId, setTopicoId] = useState("")
  const [cor, setCor] = useState("#ef4444")
  const [nomeTopico, setNomeTopico] = useState("")
  const [erroTopico, setErroTopico] = useState("")
  const [erroCriacaoTopico, setErroCriacaoTopico] = useState("")

  const [armazenamento] = useState(() => carregarTarefas())
  const [tarefas, atualizarTarefas] = useState(armazenamento.tarefas)
  const [erroArmazenamento, setErroArmazenamento] = useState(armazenamento.erro)
  const [topicos, atualizarTopicos] = useState(() => {
    try {
      const salvos = JSON.parse(localStorage.getItem("meus-topicos") ?? "[]")
      if (!Array.isArray(salvos)) return []
      return salvos.filter((topico) => topico && typeof topico.id === "string" && typeof topico.nome === "string")
    } catch {
      return []
    }
  })

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

  function fecharModal(notificar = true) {
    setErroTitulo("")
    setErroCriacaoTarefa("")
    setJanelaExpandida(false)
    setModalAberto(false)
    if (notificar) notify("Cadastro cancelado. O rascunho foi mantido.", "info")
  }

  function criarTarefa(event) {
    event.preventDefault()

    // Valida a versão sem espaços antes de montar e salvar a tarefa.
    const tituloValido = titulo.trim()

    if (!tituloValido) {
      setErroTitulo("O título da tarefa é obrigatório.")
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

  function alternarConclusao(id) {
    // Atualiza somente a tarefa selecionada, preservando os demais campos.
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
    if (tarefas.length || topicos.length) setConfirmacaoAberta(true)
  }

  function confirmarLimpeza() {
    const tarefasSalvas = setTarefas([])
    const topicosSalvos = setTopicos([])
    setConfirmacaoAberta(false)
    if (tarefasSalvas && topicosSalvos) notify("Todas as tarefas e tópicos foram excluídos.")
  }

  function criarTopico(event) {
    event.preventDefault()
    const nome = nomeTopico.trim()

    if (!nome) {
      setErroTopico("O nome do tópico é obrigatório.")
      return
    }

    // A comparação sem diferenciar maiúsculas evita tópicos duplicados por capitalização.
    const nomeJaExiste = topicos.some(
      (topico) => topico.nome.toLocaleLowerCase() === nome.toLocaleLowerCase()
    )
    if (nomeJaExiste) {
      setErroTopico("Já existe um tópico com esse nome.")
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

    setTopicos((atuais) => [...atuais, { id, nome }])
    setNomeTopico("")
    setErroTopico("")
    setErroCriacaoTopico("")
    setModalTopicoAberto(false)
  }

  function moverTarefa(id, novoTopicoId) {
    // Receber uma string vazia desvincula a tarefa de qualquer tópico.
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

      // Troca apenas as posições do grupo, sem alterar a ordem das outras tarefas.
      return atuais.map((tarefa) => {
        if (!idsDoGrupo.has(tarefa.id)) return tarefa
        const tarefaOrdenada = tarefasPorId.get(idsOrdenados[indiceOrdenado])
        indiceOrdenado += 1
        return tarefaOrdenada
      })
    })
  }

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Minhas Tarefas
      </h1>

      <p className="mt-2 text-slate-600">Organize aqui o que precisa fazer.</p>

      {erroArmazenamento && (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-800">{erroArmazenamento}</p>
      )}

      <TaskToolbar
        taskCount={tarefas.length}
        hasItems={tarefas.length > 0 || topicos.length > 0}
        onClear={limparTarefas}
        onCreateTask={() => {
          setErroTitulo("")
          setErroCriacaoTarefa("")
          setModalAberto(true)
        }}
        onCreateTopic={() => {
          setNomeTopico("")
          setErroTopico("")
          setErroCriacaoTopico("")
          setModalTopicoAberto(true)
        }}
      />

      <TaskList
        tarefas={tarefas}
        topicos={topicos}
        onToggle={alternarConclusao}
        onDelete={excluirTarefa}
        onMoveTask={moverTarefa}
        onReorderTasks={reordenarTarefas}
        onReorderTopicos={setTopicos}
      />

      <ConfirmDialog
        open={confirmacaoAberta}
        title="Excluir todas as tarefas e tópicos?"
        message="Todas as tarefas e tópicos serão removidos. Essa ação não pode ser desfeita."
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
        erroCriacao={erroCriacaoTarefa}
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
        creationError={erroCriacaoTopico}
        onNameChange={(nome) => {
          setNomeTopico(nome)
          if (erroTopico) setErroTopico("")
          if (erroCriacaoTopico) setErroCriacaoTopico("")
        }}
        onClose={() => setModalTopicoAberto(false)}
        onSubmit={criarTopico}
      />
    </>
  )
}

export default Tasks
