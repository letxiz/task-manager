import { useEffect, useRef } from "react"

// Sincroniza o estado do React com o diálogo nativo, que cuida do foco modal.
export function useDialog(open, onClose) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (open) dialog.showModal()
    else dialog.close()
  }, [open])

  function handleCancel(event) {
    // O fechamento passa pelo componente pai para manter seu estado sincronizado.
    event.preventDefault()
    onClose()
  }

  function handleBackdropClick(event) {
    if (event.target !== event.currentTarget) return
    const { left, right, top, bottom } =
      event.currentTarget.getBoundingClientRect()
    const outside =
      event.clientX < left ||
      event.clientX > right ||
      event.clientY < top ||
      event.clientY > bottom
    // Clicar no espaço interno do diálogo não é um clique no fundo.
    if (outside) onClose()
  }

  return { dialogRef, handleCancel, handleBackdropClick }
}
