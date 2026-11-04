import PropTypes from "prop-types"

// Visual compartilhado pelos cards.
function SummaryCard({ value, title, description, icon }) {
  return (
    <article className="rounded-2xl border border-orange-200 bg-white p-5 transition duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md motion-reduce:transform-none motion-reduce:transition-none">
      <div className="flex items-center justify-between gap-4">
        <span className="text-3xl font-semibold text-slate-800">
          {value}
        </span>

        <span className="rounded-lg bg-orange-100 p-2 text-primary">
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
}

export default SummaryCard
