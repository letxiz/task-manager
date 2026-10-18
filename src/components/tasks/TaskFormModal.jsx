import PropTypes from "prop-types"
import { useMemo, useState } from "react"
import {
  AlertCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react"

function formatarDataISO(data) {
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, "0")
  const dia = String(data.getDate()).padStart(2, "0")

  return `${ano}-${mes}-${dia}`
}

// Converte o formato interno AAAA-MM-DD para o formato usado na interface.
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

  // O Date ajusta datas impossíveis automaticamente; comparar os campos detecta esse ajuste.
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

// Mantém apenas números e insere as barras conforme o usuário digita.
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
    // A grade começa no domingo e sempre ocupa seis semanas para não mudar de tamanho.
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
                    // Atualiza o texto e o valor do formulário usando formatos distintos.
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
                // Atalho para selecionar a data de hoje e recolher o calendário.
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
                // Limpa a data tanto no campo visível quanto no estado do formulário.
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

MiniCalendario.propTypes = {
  valor: PropTypes.string,
  onSelecionar: PropTypes.func.isRequired,
  onExpandir: PropTypes.func,
  onContrair: PropTypes.func,
}

function TaskFormModal({
  open,
  janelaExpandida,
  titulo,
  descricao,
  data,
  erroTitulo,
  erroCriacao,
  onClose,
  onSubmit,
  onTitleChange,
  onDescriptionChange,
  onDateChange,
  onExpand,
  onContract,
}) {
  // O modal não é renderizado quando está fechado, preservando o fluxo da página.
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        // O clique no conteúdo não fecha o modal; apenas o clique no fundo o faz.
        if (event.target === event.currentTarget) {
          onClose()
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
            onClick={onClose}
            aria-label="Fechar formulário"
            className="cursor-pointer rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <form noValidate onSubmit={onSubmit} className="mt-6 space-y-4">
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
                onTitleChange(novoTitulo)
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
              onChange={(event) => onDescriptionChange(event.target.value)}
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
              onSelecionar={onDateChange}
              onExpandir={onExpand}
              onContrair={onContract}
            />
          </div>

          {erroCriacao && (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800"
            >
              {erroCriacao}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
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
  )
}

TaskFormModal.propTypes = {
  open: PropTypes.bool.isRequired,
  janelaExpandida: PropTypes.bool.isRequired,
  titulo: PropTypes.string.isRequired,
  descricao: PropTypes.string.isRequired,
  data: PropTypes.string.isRequired,
  erroTitulo: PropTypes.string,
  erroCriacao: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onTitleChange: PropTypes.func.isRequired,
  onDescriptionChange: PropTypes.func.isRequired,
  onDateChange: PropTypes.func.isRequired,
  onExpand: PropTypes.func,
  onContract: PropTypes.func,
}

export default TaskFormModal
