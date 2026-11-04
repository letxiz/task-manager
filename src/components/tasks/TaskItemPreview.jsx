import PropTypes from "prop-types"
import TaskItemContent from "./TaskItemContent"
import { taskCardClassName } from "../../constants/taskStyles"

function TaskItemPreview({ task, width, height }) {
  return (
    <div
      aria-hidden="true"
      className={`${taskCardClassName} pointer-events-none cursor-grabbing shadow-xl ring-2 ring-primary/30`}
      style={{ width, height }}
    >
      <TaskItemContent task={task} preview />
    </div>
  )
}

TaskItemPreview.propTypes = {
  task: TaskItemContent.propTypes.task,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
}


export default TaskItemPreview
