import { useCallback, useEffect, useRef, useState } from "react"
import PropTypes from "prop-types"
import { CheckCircle2, Info, X } from "lucide-react"
import { NotificationContext } from "../../contexts/NotificationContext"
import "./Animation.css"

// Exibe uma notificação e controla sua animação e seu fechamento.
function Notification({ message, type, onClose }) {
  const Icon = type === "info" ? Info : CheckCircle2

  const [paused, setPaused] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  // Altera a classe CSS para iniciar a animação de saída.
  const beginExit = useCallback(() => setIsExiting(true), [])

  // Fecha automaticamente após 4 segundos, exceto durante a interação.
  useEffect(() => {
    if (paused || isExiting) return

    const timer = setTimeout(beginExit, 4000)

    return () => clearTimeout(timer)
  }, [beginExit, isExiting, paused])

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setPaused(false)
        }
      }}
      // Remove a notificação somente depois que a animação de saída termina.
      onAnimationEnd={(event) => {
        if (isExiting && event.animationName === "notification-slide-out") {
          onClose()
        }
      }}
      // O estado define qual animação do Animation.css será executada.
      className={`pointer-events-auto flex items-start gap-3 rounded-2xl border border-green-200 bg-white p-4 text-slate-800 shadow-lg ${
        isExiting ? "notification-slide-out" : "notification-slide-in"
      }`}
    >
      <Icon
        aria-hidden="true"
        className={`mt-0.5 size-5 shrink-0 ${
          type === "info" ? "text-primary" : "text-success"
        }`}
      />

      <p className="min-w-0 flex-1 break-words text-sm leading-6">
        {message}
      </p>

      <button
        type="button"
        onClick={beginExit}
        aria-label="Fechar notificação"
        className="rounded-lg p-2 text-muted hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-primary"
      >
        <X aria-hidden="true" size={18} />
      </button>
    </div>
  )
}

Notification.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(["success", "info"]).isRequired,
  onClose: PropTypes.func.isRequired,
}

// Gerencia as notificações e disponibiliza a função notify pelo contexto.
export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(null)
  const regionRef = useRef(null)
  const nextId = useRef(0)

  // Cria uma notificação com ID próprio para identificar cada instância.
  const notify = useCallback((message, type = "success") => {
    setNotification({ id: ++nextId.current, message, type })
  }, [])

  // Limpa a notificação após o fechamento.
  const close = useCallback(() => setNotification(null), [])

  // Mantém a região visível na camada superior do navegador.
  useEffect(() => {
    const region = regionRef.current
    if (!region) return

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
        className="pointer-events-none fixed inset-auto right-4 top-4 z-50 m-0 w-[calc(100%-2rem)] overflow-visible border-0 bg-transparent p-0 sm:w-96"
      >
        {notification && (
          <Notification
            key={notification.id}
            message={notification.message}
            type={notification.type}
            onClose={close}
          />
        )}
      </div>
    </NotificationContext.Provider>
  )
}

NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired,
}