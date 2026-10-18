import { useEffect, useState } from "react"

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

  // Recupera os dados salvos ao iniciar; JSON inválido não impede a abertura da página.
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
    // Mantém a lista persistida sempre que ela muda.
    localStorage.setItem("minhas-tarefas", JSON.stringify(tarefas))
  }, [tarefas])

  useEffect(() => {
    // Os tópicos têm armazenamento próprio, independente das tarefas.
    localStorage.setItem("meus-topicos", JSON.stringify(topicos))
  }, [topicos])

  function fecharModal() {
    setErroTitulo("")
    setErroCriacaoTarefa("")
    setJanelaExpandida(false)
    setModalAberto(false)
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

    setTarefas((atuais) => [...atuais, novaTarefa])
    setTitulo("")
    setDescricao("")
    setData("")
    setTopicoId("")
    setCor("#ef4444")
    setErroTitulo("")
    setErroCriacaoTarefa("")
    setModalAberto(false)
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
    setTarefas((atuais) => atuais.filter((tarefa) => tarefa.id !== id))
  }

  function limparTarefas() {
    setTarefas([])
    setTopicos([])
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
