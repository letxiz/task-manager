import { createContext, useContext } from "react"

export const NotificationContext = createContext(null)

export function useNotification() {
  const notify = useContext(NotificationContext)
  if (!notify) throw new Error("useNotification requer NotificationProvider")
  return notify
}
