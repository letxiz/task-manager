import { useEffect, useId, useRef, useState } from "react"

export function useTooltip() {
  const tooltipId = useId()
  const wrapperRef = useRef(null)
  const hoverTimerRef = useRef(null)
  const [open, setOpen] = useState(false)

  function clearHoverTimer() {
    window.clearTimeout(hoverTimerRef.current)
    hoverTimerRef.current = null
  }

  // Evita abrir em passagens rápidas.
  function scheduleOpen() {
    if (open) return

    clearHoverTimer()
    hoverTimerRef.current = window.setTimeout(() => {
      setOpen(true)
      hoverTimerRef.current = null
    }, 600)
  }

  function handleTriggerClick() {
    clearHoverTimer()
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return undefined

    function closeOnOutsideClick(event) {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener("pointerdown", closeOnOutsideClick)
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick)
  }, [open])

  // Limpa o timer ao desmontar.
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
