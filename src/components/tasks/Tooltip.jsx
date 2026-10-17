import { useEffect, useId, useRef, useState } from "react"
import PropTypes from "prop-types"

export function useTooltip() {
  const tooltipId = useId()
  const wrapperRef = useRef(null)
  const hoverTimerRef = useRef(null)
  const [open, setOpen] = useState(false)

  // Cancela a abertura pendente, evitando que o balão apareça após o ponteiro sair.
  function clearHoverTimer() {
    window.clearTimeout(hoverTimerRef.current)
    hoverTimerRef.current = null
  }

  // Aguarda um breve intervalo para não exibir o balão em passagens rápidas.
  function scheduleOpen() {
    if (open) return

    clearHoverTimer()
    hoverTimerRef.current = window.setTimeout(() => {
      setOpen(true)
      hoverTimerRef.current = null
    }, 600)
  }

  // O clique fecha o balão, inclusive quando o foco continua no controle.
  function handleTriggerClick() {
    clearHoverTimer()
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return undefined

    // Fecha o balão quando a interação acontece fora do elemento que o contém.
    function closeOnOutsideClick(event) {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener("pointerdown", closeOnOutsideClick)
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick)
  }, [open])

  // Libera o temporizador caso o componente seja desmontado antes da abertura.
  useEffect(() => () => window.clearTimeout(hoverTimerRef.current), [])

  return {
    id: tooltipId,
    open,
    triggerProps: {
      "aria-describedby": tooltipId,
      onClick: handleTriggerClick,
    },
    wrapperProps: {
      ref: wrapperRef,
      onPointerEnter: scheduleOpen,
      onPointerLeave: () => {
        clearHoverTimer()
        setOpen(false)
      },
      onFocus: scheduleOpen,
      onBlur: (event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false)
        }
      },
      onKeyDown: (event) => {
        if (event.key === "Escape") setOpen(false)
      },
    },
  }
}

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