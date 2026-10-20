import PropTypes from "prop-types"

function Tooltip({ children, content, id, open, wrapperProps, className = "" }) {
  return (
    <span
      {...wrapperProps}
      className={`relative inline-flex ${className}`}
    >
      {children}
      <span
        id={id}
        role="tooltip"
        className={`pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-orange-200 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg transition-[opacity,visibility] duration-150 motion-reduce:transition-none ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        {content}
      </span>
    </span>
  )
}

Tooltip.propTypes = {
  children: PropTypes.node.isRequired,
  content: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  wrapperProps: PropTypes.object.isRequired,
  className: PropTypes.string,
}

export default Tooltip