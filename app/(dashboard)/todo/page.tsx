import { redirect } from "next/navigation"
import { Plus, Trash2 } from "lucide-react"
import { getCurrentContext } from "@/lib/supabase/current-studio"
import {
  updateTaskStatusGlobalAction,
  deleteTaskGlobalAction,
  createTaskGlobalAction,
} from "./actions"

export const dynamic = "force-dynamic"

const STATUS_COLOR: Record<string, string> = {
  not_started: "bg-gray-100 text-gray-600",
  in_progress: "bg-blue-100 text-blue-700",
  blocked: "bg-red-100 text-red-700",
  done: "bg-green-100 text-green-700",
  archived: "bg-gray-100 text-gray-400",
}

const STATUSES = ["not_started", "in_progress", "blocked", "done", "archived"]
const PRIORITIES = ["urgent", "high", "normal", "low"]

type FilterTab = "all" | "open" | "done"

export default async function TodoPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; add?: string }>
}) {
  const { supabase, user, studioId } = await getCurrentContext()
  if (!user) redirect("/login")
  if (!studioId) redirect("/onboarding")

  const sp = await searchParams
  const filter = (sp.filter as FilterTab) || "open"
  const showAdd = sp.add === "1"

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, code")
    .eq("studio_id", studioId)
    .order("name")

  const projectMap = new Map((projects ?? []).map((p) => [p.id, p]))
  const projectIds = (projects ?? []).map((p) => p.id)

  let query = supabase
    .from("tasks")
    .select("id, title, status, priority, due_date, project_id")
    .in(
      "project_id",
      projectIds.length ? projectIds : ["00000000-0000-0000-0000-000000000000"],
    )
    .order("due_date", { ascending: true, nullsFirst: false })

  if (filter === "open")
    query = query.in("status", ["not_started", "in_progress", "blocked"])
  if (filter === "done") query = query.in("status", ["done", "archived"])

  const { data: tasks } = await query

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "open", label: "Open" },
    { key: "done", label: "Done" },
  ]

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">To-Do</h1>
          <p className="text-sm text-gray-500">All tasks across your studio.</p>
        </div>
        {!showAdd && (
          <a
            href={`/todo?filter=${filter}&add=1`}
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-gray-800"
          >
            <Plus className="w-4 h-4" /> Add Task
          </a>
        )}
      </div>

      {showAdd && (
        <form
          action={createTaskGlobalAction}
          className="bg-white border border-gray-200 rounded-sm p-5 mb-6 grid grid-cols-4 gap-3 items-end"
        >
          <div className="col-span-4 flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-gray-900">New Task</span>
            <a
              href={`/todo?filter=${filter}`}
              className="text-xs text-gray-500 hover:text-gray-900"
            >
              Cancel
            </a>
          </div>
          <div className="col-span-2">
            <label className="text-xs text-gray-500 block mb-1">Title *</label>
            <input
              name="title"
              required
              className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm"
              placeholder="Task name"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Project *</label>
            <select
              name="project_id"
              required
              className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm"
            >
              {(projects ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} — {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Priority</label>
            <select
              name="priority"
              defaultValue="normal"
              className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Due Date</label>
            <input
              name="due_date"
              type="date"
              className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm"
            />
          </div>
          <div className="col-span-3" />
          <button
            type="submit"
            className="bg-gray-900 text-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-gray-800"
          >
            Add Task
          </button>
        </form>
      )}

      <div className="flex gap-1 mb-4">
        {tabs.map((t) => (
          <a
            key={t.key}
            href={`/todo?filter=${t.key}`}
            className={`px-3 py-1.5 text-xs rounded-sm font-medium ${
              filter === t.key
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {t.label}
          </a>
        ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-[11px] uppercase text-gray-500 tracking-wider">
            <tr>
              <th className="text-left px-4 py-2.5">Task</th>
              <th className="text-left px-4 py-2.5">Project</th>
              <th className="text-left px-4 py-2.5">Status</th>
              <th className="text-left px-4 py-2.5">Priority</th>
              <th className="text-left px-4 py-2.5">Due</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tasks?.map((t) => {
              const p = projectMap.get(t.project_id as string)
              const updateAction = updateTaskStatusGlobalAction.bind(null, t.id)
              const deleteAction = deleteTaskGlobalAction.bind(null, t.id)
              const isOverdue =
                t.due_date &&
                new Date(t.due_date as string) < new Date() &&
                t.status !== "done" &&
                t.status !== "archived"
              return (
                <tr key={t.id} className="hover:bg-gray-50 group">
                  <td className="px-4 py-3 text-gray-900">
                    <span className={isOverdue ? "text-red-600 font-medium" : ""}>
                      {t.title}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {p ? `${p.code}` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <form action={updateAction}>
                      <select
                        name="status"
                        defaultValue={t.status as string}
                        onChange="this.form.requestSubmit()"
                        className={`text-[11px] font-medium px-2 py-0.5 rounded border-0 cursor-pointer ${
                          STATUS_COLOR[t.status as string] ?? "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s.replace("_", " ")}
                          </option>
                        ))}
                      </select>
                    </form>
                  </td>
                  <td className="px-4 py-3 text-gray-500 capitalize text-xs">
                    {t.priority}
                  </td>
                  <td
                    className={`px-4 py-3 text-xs ${
                      isOverdue ? "text-red-600 font-medium" : "text-gray-500"
                    }`}
                  >
                    {t.due_date ?? "—"}
                  </td>
                  <td className="px-2">
                    <form action={deleteAction}>
                      <button
                        type="submit"
                        className="p-1 text-gray-200 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </td>
                </tr>
              )
            })}
            {(!tasks || tasks.length === 0) && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-gray-400"
                >
                  No tasks{filter !== "all" ? ` in "${filter}" tab` : ""} yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
