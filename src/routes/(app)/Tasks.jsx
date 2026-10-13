import { useEffect, useMemo, useState } from "react"
import {
  AlertCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ListChecks,
  Plus,
  Trash2,
  X,
} from "lucide-react"

function formatarDataISO(data) {
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, "0")
  const dia = String(data.getDate()).padStart(2, "0")

  return `${ano}-${mes}-${dia}`
}

function formatarDataExibicao(dataISO) {
  if (!dataISO) return ""

  const [ano, mes, dia] = dataISO.split("-")
  return `${dia}/${mes}/${ano}`
}

function converterDataDigitada(texto) {
  const correspondencia = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!correspondencia) return ""

  const [, diaTexto, mesTexto, anoTexto] = correspondencia
  const dia = Number(diaTexto)
  const mes = Number(mesTexto)
  const ano = Number(anoTexto)
  const data = new Date(ano, mes - 1, dia)

  if (
    ano < 1000 ||
    data.getFullYear() !== ano ||
    data.getMonth() !== mes - 1 ||
    data.getDate() !== dia
  ) {
    return ""
  }

  return formatarDataISO(data)
}

function aplicarMascaraData(valor) {
  const digitos = valor.replace(/\D/g, "").slice(0, 8)

  if (digitos.length <= 2) return digitos
  if (digitos.length <= 4) {
    return `${digitos.slice(0, 2)}/${digitos.slice(2)}`
  }

  return `${digitos.slice(0, 2)}/${digitos.slice(2, 4)}/${digitos.slice(4)}`
}

function MiniCalendario({ valor, onSelecionar, onExpandir, onContrair }) {
  const [mesAtual, setMesAtual] = useState(() => {
    const dataInicial = valor ? new Date(`${valor}T00:00:00`) : new Date()
    return new Date(dataInicial.getFullYear(), dataInicial.getMonth(), 1)
  })

  const diasDoMes = useMemo(() => {
    const ano = mesAtual.getFullYear()
    const mes = mesAtual.getMonth()
    const primeiroDia = new Date(ano, mes, 1)
    const inicioGrid = new Date(primeiroDia)
    inicioGrid.setDate(primeiroDia.getDate() - primeiroDia.getDay())

    const dias = []

    for (let index = 0; index < 42; index += 1) {
      const data = new Date(inicioGrid)
      data.setDate(inicioGrid.getDate() + index)
      dias.push(data)
    }

    return dias
  }, [mesAtual])

  const [textoData, setTextoData] = useState(() => formatarDataExibicao(valor))
  const dataInvalida = textoData.length === 10 && !converterDataDigitada(textoData)
  const dataSelecionada = valor ? new Date(`${valor}T00:00:00`) : null
  const [aberto, setAberto] = useState(false)

  function alternarCalendario() {
    const proximoEstado = !aberto
    setAberto(proximoEstado)

    if (proximoEstado) {
      onExpandir?.()
      return
    }

    onContrair?.()
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center gap-2">
        <input
          id="data"
          type="text"
          inputMode="numeric"
          maxLength={10}
          value={textoData}
          onChange={(event) => {
            const proximoTexto = aplicarMascaraData(event.target.value)
            setTextoData(proximoTexto)
            onSelecionar(converterDataDigitada(proximoTexto))
          }}
          placeholder="DD/MM/AAAA"
          aria-invalid={dataInvalida}
          aria-describedby={dataInvalida ? "data-error" : undefined}
          className={`w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition-colors hover:border-red-600 focus:ring-2 focus:ring-red-100 ${
            dataInvalida
              ? "border-red-500 focus:border-red-600"
              : "border-slate-300 focus:border-red-600"
          }`}
          aria-label="Data da tarefa"
        />

        <button
          type="button"
          onClick={alternarCalendario}
          className="flex h-[42px] w-[42px] items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-600 transition-colors hover:border-red-600 hover:text-red-700 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-100"
          aria-label="Abrir calendário"
        >
          <CalendarDays size={18} />
        </button>
      </div>

      {dataInvalida && (
        <p id="data-error" role="alert" className="mt-2 text-xs text-red-600">
          Digite uma data válida no formato DD/MM/AAAA.
        </p>
      )}

      {aberto && (
        <div className="mt-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() =>
                setMesAtual(
                  new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1, 1)
                )
              }
              className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-white hover:text-red-700"
              aria-label="Mês anterior"
            >
              <ChevronLeft size={18} />
            </button>

            <span className="text-sm font-semibold capitalize text-slate-700">
              {mesAtual.toLocaleDateString("pt-BR", {
                month: "long",
                year: "numeric",
              })}
            </span>

            <button
              type="button"
              onClick={() =>
                setMesAtual(
                  new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 1)
                )
              }
              className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-white hover:text-red-700"
              aria-label="Próximo mês"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-medium uppercase tracking-wide text-slate-500">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dia) => (
              <span key={dia}>{dia}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {diasDoMes.map((dia) => {
              const hoje = new Date()
              const eHoje = dia.toDateString() === hoje.toDateString()
              const selecionado =
                dataSelecionada &&
                dia.toDateString() === dataSelecionada.toDateString()
              const mesAtualValido = dia.getMonth() === mesAtual.getMonth()

              return (
                <button
                  key={dia.toISOString()}
                  type="button"
                  onClick={() => {
                    const dataISO = formatarDataISO(dia)
                    setTextoData(formatarDataExibicao(dataISO))
                    onSelecionar(dataISO)
                    setMesAtual(new Date(dia.getFullYear(), dia.getMonth(), 1))
                    setAberto(false)
                    onContrair?.()
                  }}
                  className={`group relative flex h-9 items-center justify-center rounded-full text-sm transition-colors ${
                    selecionado
                      ? "bg-red-700 font-semibold text-white"
                      : mesAtualValido
                        ? "text-slate-700 hover:bg-red-50 hover:text-red-700"
                        : "text-slate-300 hover:bg-slate-100"
                  }`}
                >
                  {!selecionado && eHoje && (
                    <span className="absolute inset-1 rounded-full bg-blue-500/80" />
                  )}

                  <span className="relative z-10">{dia.getDate()}</span>

                  {eHoje && !selecionado && (
                    <span className="pointer-events-none absolute -top-9 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                      Dia atual
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-200 pt-3">
            <button
              type="button"
              onClick={() => {
                const hoje = new Date()
                const dataISO = formatarDataISO(hoje)
                setTextoData(formatarDataExibicao(dataISO))
                onSelecionar(dataISO)
                setMesAtual(new Date(hoje.getFullYear(), hoje.getMonth(), 1))
                setAberto(false)
                onContrair?.()
              }}
              className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-100"
            >
              Hoje
            </button>

            <button
              type="button"
              onClick={() => {
                setTextoData("")
                onSelecionar("")
                setAberto(false)
                onContrair?.()
              }}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Limpar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

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

      <p className="mt-2 text-slate-600">
        Organize aqui o que precisa fazer.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <span className="text-lg font-bold text-slate-700">
          Minhas Tarefas {tarefas.length}
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
            onClick={() => {
              setErroTitulo("")
              setModalAberto(true)
            }}
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
          <ListChecks size={40} aria-hidden="true" className="mx-auto text-red-700" />

          <h2 id="tasks-empty-title" className="mt-4 text-lg font-semibold">
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
                    Prazo: {" "}
                    {new Date(`${tarefa.data}T00:00:00`).toLocaleDateString("pt-BR")}
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setJanelaExpandida(false)
              setModalAberto(false)
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-titulo"
            className={`my-auto max-h-[92vh] w-[min(90vw,420px)] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl transition-all duration-200 ${
              janelaExpandida ? "max-w-[560px]" : "max-w-[420px]"
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 id="modal-titulo" className="text-xl font-semibold text-slate-800">
                  Nova tarefa
                </h2>
              </div>

              <button
                type="button"
                onClick={() => {
                  setErroTitulo("")
                  setJanelaExpandida(false)
                  setModalAberto(false)
                }}
                aria-label="Fechar formulário"
                className="cursor-pointer rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form noValidate onSubmit={criarTarefa} className="mt-6 space-y-4">
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
                    const novoTitulo = event.target.value
                    setTitulo(novoTitulo)

                    if (erroTitulo && novoTitulo.trim()) {
                      setErroTitulo("")
                    }
                  }}
                  placeholder="Ex.: Ir para a academia"
                  maxLength={100}
                  autoFocus
                  aria-invalid={Boolean(erroTitulo)}
                  aria-describedby={erroTitulo ? "titulo-error" : undefined}
                  className={`w-full rounded-xl border px-3 py-2.5 outline-none focus:ring-2 focus:ring-red-100 ${
                    erroTitulo
                      ? "border-red-500 focus:border-red-600"
                      : "border-slate-300 focus:border-red-600"
                  }`}
                />

                {erroTitulo && (
                  <p
                    id="titulo-error"
                    role="alert"
                    className="mt-2 flex items-center gap-2 text-sm font-medium text-red-600"
                  >
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{erroTitulo}</span>
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
                  rows={4}
                  maxLength={500}
                  className="h-28 w-full resize-none rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100"
                />

                <div className="mt-1 text-right text-xs text-slate-500">
                  {descricao.length}/500
                </div>
              </div>

              <div>
                <label
                  htmlFor="data"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Data
                </label>

                <MiniCalendario
                  valor={data}
                  onSelecionar={setData}
                  onExpandir={() => setJanelaExpandida(true)}
                  onContrair={() => setJanelaExpandida(false)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setErroTitulo("")
                    setJanelaExpandida(false)
                    setModalAberto(false)
                  }}
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
