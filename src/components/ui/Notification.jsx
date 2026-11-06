import { useCallback, useEffect, useRef, useState } from "react"
import PropTypes from "prop-types"
import { CheckCircle2, Info, X } from "lucide-react"
import { NotificationContext } from "../../contexts/NotificationContext"

function Notification({ message, type, onClose }) {
  const Icon = type === "info" ? Info : CheckCircle2
  const [paused, setPaused] = useState(false)

  // Reinicia o prazo após a interação.
  useEffect(() => {
    if (paused) return
    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  }, [paused, onClose])

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false)
      }}
      className="pointer-events-auto flex items-center gap-2.5 rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-stone-800 shadow-md"
    >
      <Icon aria-hidden="true" className={`size-[18px] shrink-0 ${type === "info" ? "text-primary" : "text-success"}`} />
      <p className="min-w-0 flex-1 break-words text-sm leading-5">{message}</p>
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar notificação"
        className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-primary"
      >
        <X aria-hidden="true" size={16} />
      </button>
    </div>
  )
}

Notification.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(["success", "info"]).isRequired,
  onClose: PropTypes.func.isRequired,
}

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(null)
  const regionRef = useRef(null)
  // Cada aviso tem seu próprio timer.
  const nextId = useRef(0)
  const notify = useCallback((message, type = "success") => {
    setNotification({ id: ++nextId.current, message, type })
  }, [])
  const close = useCallback(() => setNotification(null), [])

  // Exibe avisos acima dos modais.
  useEffect(() => {
    const region = regionRef.current
    if (notification) region.showPopover()
    else region.hidePopover()
  }, [notification])

  return (
    <NotificationContext.Provider value={notify}>
      {children}
      <div
        ref={regionRef}
        popover="manual"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed inset-auto right-4 top-4 z-50 m-0 h-fit w-[calc(100%-2rem)] max-w-sm overflow-visible border-0 bg-transparent p-0"
      >
        {notification && (
          <Notification key={notification.id} message={notification.message} type={notification.type} onClose={close} />
        )}
      </div>
    </NotificationContext.Provider>
  )
}

NotificationProvider.propTypes = { children: PropTypes.node.isRequired }
