import { createTaskAction, toggleTaskAction, deleteTaskAction } from "./actions"

type Task = {
  id: string
  title: string
  status: string
  priority: string | null
  due_date: string | null
}

const statusColor: Record<string, string> = {
  not_started: "bg-gray-100 text-gray-700",
  in_progress: "bg-blue-100 text-blue-700",
  blocked: "bg-red-100 text-red-700",
  done: "bg-green-100 text-green-700",
  archived: "bg-gray-100 text-gray-500",
}

const priorityColor: Record<string, string> = {
  low: "text-gray-500",
  normal: "text-gray-600",
  high: "text-orange-600",
  urgent: "text-red-600",
}

export function TasksTab({ projectId, tasks }: { projectId: string; tasks: Task[] }) {
  const createAction = createTaskAction.bind(null, projectId)
  const pending = tasks.filter((t) => t.status !== "done" && t.status !== "archived")
  const completed = tasks.filter((t) => t.status === "done")

  return (
    <div>
      <form action={createAction} className="flex gap-2 mb-6 p-4 border rounded-md bg-gray-50">
        <input
          name="title"
          placeholder="New task title..."
          required
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
        />
        <select name="priority" defaultValue="normal" className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white">
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
        <input name="due_date" type="date" className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white" />
        <button type="submit" className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800">
          Add Task
        </button>
      </form>

      {tasks.length === 0 ? (
        <div className="text-center py-12 text-sm text-gray-500">No tasks yet. Add your first task above.</div>
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && <TaskList projectId={projectId} tasks={pending} title="Open" />}
          {completed.length > 0 && <TaskList projectId={projectId} tasks={completed} title="Completed" />}
        </div>
      )}
    </div>
  )
}

function TaskList({ projectId, tasks, title }: { projectId: string; tasks: Task[]; title: string }) {
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">
        {title} <span className="text-gray-400 font-normal">({tasks.length})</span>
      </h3>
      <div className="divide-y border rounded-md">
        {tasks.map((t) => {
          const toggleAction = toggleTaskAction.bind(null, t.id, projectId, t.status !== "done")
          const deleteAction = deleteTaskAction.bind(null, t.id, projectId)
          const done = t.status === "done"
          const boxCls =
            "w-5 h-5 rounded border flex items-center justify-center " +
            (done ? "bg-black border-black text-white" : "bg-white border-gray-300")
          const titleCls = "text-sm " + (done ? "line-through text-gray-400" : "text-gray-900")
          const statusCls =
            "text-xs px-2 py-0.5 rounded-full " + (statusColor[t.status] || "bg-gray-100")
          const prioCls = "text-xs " + ((t.priority && priorityColor[t.priority]) || "text-gray-500")
          return (
            <div key={t.id} className="flex items-center gap-3 p-3 hover:bg-gray-50">
              <form action={toggleAction}>
                <button type="submit" className={boxCls}>
                  {done && <span className="text-xs">✓</span>}
                </button>
              </form>
              <div className="flex-1">
                <div className={titleCls}>{t.title}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={statusCls}>{t.status.replace("_", " ")}</span>
                  {t.priority && <span className={prioCls}>{t.priority}</span>}
                  {t.due_date && <span className="text-xs text-gray-500">Due {t.due_date}</span>}
                </div>
              </div>
              <form action={deleteAction}>
                <button type="submit" className="text-xs text-gray-400 hover:text-red-600">Delete</button>
              </form>
            </div>
          )
        })}
      </div>
    </div>
  )
}
