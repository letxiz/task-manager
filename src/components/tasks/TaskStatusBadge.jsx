import PropTypes from "prop-types"
import { CircleCheck, Clock } from "lucide-react"

export default function TaskStatusBadge({ completed = false, className = "" }) {
  const Icon = completed ? CircleCheck : Clock
  const label = completed ? "Concluída" : "Pendente"
  const colors = completed
    ? "bg-emerald-100 text-emerald-800 ring-emerald-300"
    : "bg-amber-100 text-amber-800 ring-amber-300"

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ring-1 ring-inset ${colors} ${className}`}
    >
      <Icon size={14} className="shrink-0" aria-hidden="true" />
      {label}
    </span>
  )
}

TaskStatusBadge.propTypes = {
  completed: PropTypes.bool,
  className: PropTypes.string,
}
