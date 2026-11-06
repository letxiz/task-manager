import HomeHeader from "../../components/home/HomeHeader"
import HomeSummary from "../../components/home/HomeSummary"
import HomeTaskList from "../../components/home/HomeTaskList"
import WaterPanel from "../../components/home/WaterPanel"
import DetailsModal from "../../components/tasks/DetailsModal"
import TaskFormModal from "../../components/tasks/TaskFormModal"
import { useHomeTasks } from "../../hooks/home/useHomeTasks"
import { useWaterTracker } from "../../hooks/home/useWaterTracker"

function Home() {
  const { dados, formulario, detalhes, verDetalhes } = useHomeTasks()
  const agua = useWaterTracker()
  const concluidas = dados.tarefas.filter((tarefa) => tarefa.concluida).length

  return (
    <div className="space-y-7">
      <HomeHeader />
      {dados.erroArmazenamento && (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">{dados.erroArmazenamento}</p>
      )}
      <HomeSummary total={dados.tarefas.length} concluidas={concluidas} agua={agua} />
      <div className="grid items-stretch gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <HomeTaskList tarefas={dados.tarefas} topicos={dados.topicos} onToggle={dados.alternarConclusao} onDetails={verDetalhes} onCreate={formulario.abrir} />
        <WaterPanel agua={agua} />
      </div>
      <DetailsModal {...detalhes} />
      <TaskFormModal {...formulario.props} />
    </div>
  )
}

export default Home
