import { useEffect, useState } from "react"
import { ListChecks, Trash2, X, Plus, CircleAlert } from "lucide-react"

function Tasks() {
  const [modalAberto, setModalAberto] = useState(false)

  const [titulo, setTitulo] = useState("")
  const [descricao, setDescricao] = useState("")
  const [data, setData] = useState("")
  const [erroTitulo, setErroTitulo] = useState(false)

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

  function abrirModal() {
    setErroTitulo(false)
    setModalAberto(true)
  }

  function fecharModal() {
    setErroTitulo(false)
    setModalAberto(false)
  }

  function criarTarefa(event) {
    event.preventDefault()

    if (!titulo.trim()) {
      setErroTitulo(true)
      return
    }

    setErroTitulo(false)

    const novaTarefa = {
      id: crypto.randomUUID(),
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      data,
      concluida: false,
    }

    setTarefas((atuais) => [...atuais, novaTarefa])

    setTitulo("")
    setDescricao("")
    setData("")
    fecharModal()
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
    setTarefas((atuais) =>
      atuais.filter((tarefa) => tarefa.id !== id)
    )
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

      <p className="mt-2 text-slate-600">
        Organize aqui o que precisa fazer.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <span className="text-lg font-bold text-slate-700">
          Minhas Tarefas ({tarefas.length})
        </span>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={limparTarefas}
            disabled={tarefas.length === 0}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-500 transition-colors hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Limpar tarefas
            <Trash2 size={18} />
          </button>

          <button
            type="button"
            onClick={abrirModal}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
          >
            Nova tarefa
            <Plus size={18} />
          </button>
        </div>
      </div>

      {tarefas.length === 0 ? (
        <section
          aria-labelledby="tasks-empty-title"
          className="mt-6 rounded-2xl border border-dashed border-orange-300 bg-white px-6 py-12 text-center"
        >
          <ListChecks
            size={40}
            aria-hidden="true"
            className="mx-auto text-red-700"
          />

          <h2
            id="tasks-empty-title"
            className="mt-4 text-lg font-semibold"
          >
            Sua lista está vazia
          </h2>

          <p className="mx-auto mt-2 max-w-md leading-7 text-slate-600">
            Comece adicionando sua primeira tarefa.
          </p>
        </section>
      ) : (
        <ul className="mt-6 space-y-3">
          {tarefas.map((tarefa) => (
            <li
              key={tarefa.id}
              className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <input
                type="checkbox"
                checked={tarefa.concluida}
                onChange={() => alternarConclusao(tarefa.id)}
                aria-label={`Concluir ${tarefa.titulo}`}
                className="mt-1 size-4 cursor-pointer accent-red-700"
              />

              <div className="min-w-0 flex-1">
                <h2
                  className={`font-semibold ${
                    tarefa.concluida
                      ? "text-slate-400 line-through"
                      : "text-slate-800"
                  }`}
                >
                  {tarefa.titulo}
                </h2>

                {tarefa.descricao && (
                  <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-600">
                    {tarefa.descricao}
                  </p>
                )}

                {tarefa.data && (
                  <p className="mt-2 text-xs text-slate-500">
                    Prazo:{" "}
                    {new Date(
                      `${tarefa.data}T00:00:00`
                    ).toLocaleDateString("pt-BR")}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => excluirTarefa(tarefa.id)}
                aria-label={`Excluir ${tarefa.titulo}`}
                title="Excluir tarefa"
                className="cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 size={18} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {modalAberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              fecharModal()
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-titulo"
            className="my-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2
                  id="modal-titulo"
                  className="text-xl font-semibold text-slate-800"
                >
                  Nova tarefa
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Preencha os dados abaixo.
                </p>
              </div>

              <button
                type="button"
                onClick={fecharModal}
                aria-label="Fechar formulário"
                className="cursor-pointer rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={criarTarefa}
              noValidate
              className="mt-6 space-y-4"
            >
              <div>
                <label
                  htmlFor="titulo"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Título *
                </label>

                <input
                  id="titulo"
                  type="text"
                  value={titulo}
                  onChange={(event) => {
                    setTitulo(event.target.value)
                    if (event.target.value.trim()) {
                      setErroTitulo(false)
                    }
                  }}
                  placeholder="Ex.: Estudar React"
                  maxLength={100}
                  autoFocus
                  aria-invalid={erroTitulo}
                  aria-describedby={erroTitulo ? "erro-titulo" : undefined}
                  className={`w-full rounded-xl border px-3 py-2.5 outline-none focus:ring-2 ${
                    erroTitulo
                      ? "border-red-600 focus:border-red-600 focus:ring-red-100"
                      : "border-slate-300 focus:border-red-600 focus:ring-red-100"
                  }`}
                />

                {erroTitulo && (
                  <p
                    id="erro-titulo"
                    role="alert"
                    className="mt-2 flex items-center gap-2 text-sm text-red-600"
                  >
                    <CircleAlert size={16} aria-hidden="true" />
                    O título da tarefa é obrigatório.
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="descricao"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Descrição
                </label>

                <textarea
                  id="descricao"
                  value={descricao}
                  onChange={(event) => setDescricao(event.target.value)}
                  placeholder="Descreva o que precisa fazer..."
                  rows={3}
                  maxLength={1000}
                  className="w-full resize-y rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100"
                />
              </div>

              <div>
                <label
                  htmlFor="data"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Data
                </label>

                <input
                  id="data"
                  type="date"
                  value={data}
                  onChange={(event) => setData(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={fecharModal}
                  className="cursor-pointer rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="cursor-pointer rounded-xl bg-red-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-800"
                >
                  Salvar tarefa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default Tasks
