import PropTypes from "prop-types"

// Visual compartilhado pelos cards.
function SummaryCard({ value, title, description, icon, water = false }) {
  return (
    <article className={`rounded-2xl border bg-white p-5 transition duration-200 hover:-translate-y-1 hover:shadow-md motion-reduce:transform-none motion-reduce:transition-none border-orange-200 hover:border-primary/30`}>
      <div className="flex items-center justify-between gap-4">
        <span className="text-3xl font-semibold text-slate-800">
          {value}
        </span>

        <span className={`rounded-lg p-2 ${water ? "bg-slate-100 text-blue-700" : "bg-orange-100 text-primary"}`}>
          {icon}
        </span>
      </div>

      <h2 className="mt-4 text-sm font-medium text-slate-800">
        {title}
      </h2>

      <p className="mt-1 text-xs text-muted">{description}</p>
    </article>
  )
}

SummaryCard.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  water: PropTypes.bool,
}

export default SummaryCard
