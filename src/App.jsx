import TaskProvider from "./components/tasks/TaskProvider"
import { NotificationProvider } from "./components/ui/Notification"
import { Route, Routes } from "react-router-dom"
import AppLayout from "./routes/(app)/layout"
import Home from "./routes/(app)/Home"
import Tasks from "./routes/(app)/Tasks"
import NotFound from "./routes/(app)/NotFound"

function App() {
  return (
    <NotificationProvider>
      <TaskProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Home />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </TaskProvider>
    </NotificationProvider>
  )
}

export default App
