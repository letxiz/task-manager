import { useMemo } from "react"
import { diaLocal } from "../../utils/waterStorage"
import HomeHeader from "../../components/home/HomeHeader"
import HomeSummary from "../../components/home/HomeSummary"
import HomeTaskList from "../../components/home/HomeTaskList"
import WaterPanel from "../../components/home/WaterPanel"
import DetailsModal from "../../components/tasks/modals/DetailsModal"
import TaskForm from "../../components/tasks/modals/TaskForm"
import { useHomeTasks } from "../../hooks/home/useHomeTasks"
import { useWaterTracker } from "../../hooks/home/useWaterTracker"

function Home() {
  const { dados, formulario, formularioRef, detalhes, verDetalhes } = useHomeTasks()
  const agua = useWaterTracker()
  const concluidas = useMemo(() => dados.tarefas.filter((tarefa) => tarefa.concluida).length, [dados.tarefas])

  return (
    <div className="space-y-7">
      <HomeHeader />
      {dados.erroArmazenamento && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 p-4 text-sm text-red-800"
        >
          {dados.erroArmazenamento}
        </p>
      )}
      <HomeSummary
        total={dados.tarefas.length}
        concluidas={concluidas}
        agua={agua}
      />
      <div className="grid items-stretch gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <HomeTaskList
          hoje={diaLocal()}
          tarefas={dados.tarefas}
          topicos={dados.topicos}
          onToggle={dados.alternarConclusao}
          onDetails={verDetalhes}
          onCreate={formulario.abrir}
        />
        <WaterPanel agua={agua} />
      </div>
      <DetailsModal {...detalhes} />
      <TaskForm ref={formularioRef} dados={dados} />
    </div>
  )
}

export default Home
