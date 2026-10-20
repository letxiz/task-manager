import { useEffect, useId, useRef, useState } from "react"

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
