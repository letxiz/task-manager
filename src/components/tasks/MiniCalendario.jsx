import PropTypes from "prop-types"
import { useMemo, useState } from "react"
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"
import { formatarDataISO, formatarDataExibicao, converterDataDigitada, aplicarMascaraData } from "../../utils/dateUtils"

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
    // Grade fixa de seis semanas.
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
  // Data vazia é opcional.
  const dataInvalida = textoData.length > 0 && !converterDataDigitada(textoData)
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
          // Validação nativa da data.
          ref={(input) => input?.setCustomValidity(
            dataInvalida ? "Digite uma data válida no formato DD/MM/AAAA." : ""
          )}
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
          aria-label={aberto ? "Fechar calendário" : "Abrir calendário"}
          aria-expanded={aberto}
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

MiniCalendario.propTypes = {
  valor: PropTypes.string,
  onSelecionar: PropTypes.func.isRequired,
  onExpandir: PropTypes.func,
  onContrair: PropTypes.func,
}


export default MiniCalendario
