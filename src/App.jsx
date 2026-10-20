import { NotificationProvider } from "./components/ui/Notification"
import { Route, Routes } from "react-router-dom"
import AppLayout from "./routes/(app)/layout"
import Home from "./routes/(app)/Home"
import Tasks from "./routes/(app)/Tasks"
import NotFound from "./routes/(app)/NotFound"

function App() {
  return (
    <NotificationProvider>
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
    </NotificationProvider>
  )
}

export default App
