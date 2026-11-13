import { lazy, Suspense } from "react"
import TaskRouteBoundary from "./components/tasks/TaskRouteBoundary"
import TaskProvider from "./components/tasks/TaskProvider"
import { NotificationProvider } from "./components/ui/Notification"
import { Route, Routes } from "react-router-dom"
import AppLayout from "./routes/(app)/layout"
import Home from "./routes/(app)/Home"
import NotFound from "./routes/(app)/NotFound"

const Tasks = lazy(() => import("./routes/(app)/Tasks"))

function App() {
  return (
    <NotificationProvider>
      <TaskProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Home />} />
            <Route path="tasks" element={
              <TaskRouteBoundary>
                <Suspense fallback={<p role="status" className="py-8 text-muted">Carregando tarefas…</p>}>
                  <Tasks />
                </Suspense>
              </TaskRouteBoundary>
            } />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </TaskProvider>
    </NotificationProvider>
  )
}

export default App
