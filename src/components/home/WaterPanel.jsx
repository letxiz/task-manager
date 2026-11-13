import { useState } from "react"
import PropTypes from "prop-types"
import { Droplet, Heart, Plus, Settings2, Undo2 } from "lucide-react"
import { formatarLitros } from "../../utils/waterStorage"
import WaterGoalModal from "./WaterGoalModal"

const WATER_AMOUNTS = [100, 250, 500, 1000]

export default function WaterPanel({ agua }) {
  const [metaAberta, setMetaAberta] = useState(false)
  // Não mostra saldo negativo.
  const falta = Math.max(0, agua.meta - agua.total)

  return (
    <section
      aria-labelledby="water-title"
      className="rounded-2xl border border-orange-200 bg-white p-5 sm:p-6 transition duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md focus-within:border-primary/30 focus-within:shadow-md motion-reduce:transform-none motion-reduce:transition-none"
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 id="water-title" className="text-lg font-semibold">
            Água
          </h2>
          <p className="mt-1 text-sm leading-5 text-muted">
            Cuidar de você também é prioridade.
          </p>
        </div>
        <Droplet
          size={20}
          className="mt-1 shrink-0 text-water"
          aria-hidden="true"
        />
      </header>
      <div className="relative mx-auto my-6 size-40">
        <svg
          viewBox="0 0 160 160"
          className="size-full -rotate-90"
          aria-hidden="true"
        >
          <circle
            cx="80"
            cy="80"
            r="68"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-water-track"
          />
          <circle
            cx="80"
            cy="80"
            r="68"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            pathLength="100"
            strokeDasharray={`${agua.porcentagem} 100`}
            strokeLinecap="round"
            className="text-water transition-all duration-300 motion-reduce:transition-none"
          />
        </svg>
        <div
          role="progressbar"
          aria-label="Meta diária de água"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={agua.porcentagem}
          aria-valuetext={`${formatarLitros(agua.total)} de ${formatarLitros(agua.meta)}`}
          className="absolute inset-0 flex flex-col items-center justify-center"
        >
          <Droplet size={18} className="text-water" aria-hidden="true" />
          <span className="mt-1 text-3xl font-semibold">
            {agua.porcentagem}%
          </span>
          <span className="mt-1 text-sm text-muted">da meta diária</span>
        </div>
      </div>
      <div className="text-center" aria-live="polite">
        <p className="text-base font-semibold">
          {formatarLitros(agua.total)} de {formatarLitros(agua.meta)}
        </p>
        <p className="mt-1 text-sm leading-5 text-muted">
          {falta > 0
            ? `Faltam ${formatarLitros(falta)} para sua meta.`
            : "Meta de hoje concluída!"}
        </p>
      </div>
      {agua.erro && (
        <p
          role="alert"
          className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-danger"
        >
          {agua.erro}
        </p>
      )}
      <p className="mb-2 mt-6 text-sm text-muted">Quanto você bebeu agora?</p>
      <div className="grid grid-cols-2 gap-2">
        {WATER_AMOUNTS.map((quantidade) => (
          <button
            key={quantidade}
            type="button"
            onClick={() => agua.adicionar(quantidade)}
            aria-label={`Registrar ${quantidade} ml de água`}
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${quantidade === 250 ? "border-primary bg-primary text-white hover:bg-primary-hover" : "border-slate-200 bg-primary/5 text-primary hover:bg-primary/10"}`}
          >
            <Plus size={14} aria-hidden="true" />
            {quantidade === 1000 ? "1 litro" : `${quantidade} ml`}
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap justify-between gap-2">
        <button
          type="button"
          onClick={agua.desfazer}
          disabled={!agua.temRegistros}
          className="inline-flex min-h-10 items-center gap-1 rounded-lg px-2 text-sm text-muted enabled:hover:text-primary disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-primary"
        >
          <Undo2 size={14} aria-hidden="true" />
          Desfazer último
        </button>
        <button
          type="button"
          onClick={() => setMetaAberta(true)}
          className="inline-flex min-h-10 items-center gap-1 rounded-lg px-2 text-sm text-muted hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
        >
          <Settings2 size={14} aria-hidden="true" />
          Ajustar meta
        </button>
      </div>
      <p className="mt-3 flex items-center justify-center gap-1 text-sm text-muted">
        <Heart size={13} aria-hidden="true" />
        Pequenas pausas fazem bem.
      </p>
      {metaAberta && (
        <WaterGoalModal
          open
          goal={agua.meta}
          onSave={agua.alterarMeta}
          onCancel={() => {
            setMetaAberta(false)
          }}
        />
      )}
    </section>
  )
}

WaterPanel.propTypes = {
  agua: PropTypes.shape({
    total: PropTypes.number.isRequired,
    meta: PropTypes.number.isRequired,
    porcentagem: PropTypes.number.isRequired,
    erro: PropTypes.string,
    adicionar: PropTypes.func.isRequired,
    desfazer: PropTypes.func.isRequired,
    alterarMeta: PropTypes.func.isRequired,
    temRegistros: PropTypes.bool.isRequired,
  }).isRequired,
}
