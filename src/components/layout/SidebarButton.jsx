import PropTypes from "prop-types"
import { NavLink } from "react-router-dom"
import { tv } from "tailwind-variants"

const sidebarButton = tv({
  base: "group relative flex min-h-12 items-center gap-3 rounded-xl text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 motion-reduce:transition-none",
  variants: {
    selected: {
      true: "bg-red-200/70 font-semibold text-red-900 shadow-sm hover:bg-red-200",
      false: "font-medium text-slate-700 hover:bg-orange-200/70 hover:text-slate-950",
    },
    recolhida: {
      true: "justify-center px-0",
      false: "px-4",
    },
  },
})

const SidebarButton = ({ children, to, label, recolhida = false, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      sidebarButton({ selected: isActive, recolhida })
    }
  >
    {children}
    <span className={recolhida ? "sr-only" : "whitespace-nowrap"}>{label}</span>
    {recolhida && (
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-full top-1/2 z-20 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
      >
        {label}
      </span>
    )}
  </NavLink>
)

SidebarButton.propTypes = {
  children: PropTypes.node.isRequired,
  to: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  recolhida: PropTypes.bool,
  onClick: PropTypes.func,
}

export default SidebarButton
