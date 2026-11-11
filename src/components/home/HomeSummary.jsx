import PropTypes from "prop-types"
import { CircleCheck, Clock, Droplet, ListTodo } from "lucide-react"
import { formatarLitros } from "../../utils/waterStorage"
import SummaryCard from "./SummaryCard"

export default function HomeSummary({ total, concluidas, agua }) {
  // Os cards usam os dados compartilhados.
  return (
    <section aria-label="Resumo das tarefas e da água" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard value={total} title="Total de tarefas" description="Tudo o que você está organizando" icon={<ListTodo size={20} aria-hidden="true" />} />
      <SummaryCard value={concluidas} title="Tarefas concluídas" description="Cada conquista conta" icon={<CircleCheck size={20} aria-hidden="true" />} />
      <SummaryCard value={total - concluidas} title="Tarefas pendentes" description="Um passo de cada vez" icon={<Clock size={20} aria-hidden="true" />} />
      <SummaryCard water value={`${agua.porcentagem}%`} title="Meta de água" description={`${formatarLitros(agua.total)} de ${formatarLitros(agua.meta)}`} icon={<Droplet size={20} aria-hidden="true" />} />
    </section>
  )
}

HomeSummary.propTypes = {
  total: PropTypes.number.isRequired,
  concluidas: PropTypes.number.isRequired,
  agua: PropTypes.shape({ total: PropTypes.number.isRequired, meta: PropTypes.number.isRequired, porcentagem: PropTypes.number.isRequired }).isRequired,
}
