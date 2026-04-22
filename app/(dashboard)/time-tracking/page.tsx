import { redirect } from "next/navigation"
import { Plus, Trash2, Clock } from "lucide-react"
import { getCurrentContext } from "@/lib/supabase/current-studio"
import {
  createTimeEntryGlobalAction,
  deleteTimeEntryGlobalAction,
} from "./actions"

export const dynamic = "force-dynamic"

export default async function TimeTrackingPage({
  searchParams,
}: {
  searchParams: Promise<{ add?: string; project?: string }>
}) {
  const { supabase, user, studioId } = await getCurrentContext()
  if (!user) redirect("/login")
  if (!studioId) redirect("/onboarding")

  const sp = await searchParams
  const showAdd = sp.add === "1"
  const filterProject = sp.project || "all"

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, code")
    .eq("studio_id", studioId)
    .order("name")

  const projectMap = new Map((projects ?? []).map((p) => [p.id, p]))
  const projectIds = (projects ?? []).map((p) => p.id)

  let query = supabase
    .from("time_entries")
    .select("id, project_id, start_at, minutes, note")
    .in(
      "project_id",
      projectIds.length ? projectIds : ["00000000-0000-0000-0000-000000000000"],
    )
    .order("start_at", { ascending: false })

  if (filterProject !== "all") query = query.eq("project_id", filterProject)

  const { data: entries } = await query

  const totalMinutes = (entries ?? []).reduce(
    (s, e) => s + Number(e.minutes ?? 0),
    0,
  )

  // Group by project for summary
  const byProject = new Map<string, number>()
  for (const e of entries ?? []) {
    const prev = byProject.get(e.project_id as string) ?? 0
    byProject.set(e.project_id as string, prev + Number(e.minutes ?? 0))
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Time Tracking</h1>
          <p className="text-sm text-gray-500">
            Log billable hours —{" "}
            <span className="font-medium text-gray-700">
              {(totalMinutes / 60).toFixed(1)}h total
            </span>
          </p>
        </div>
        {!showAdd && (
          <a
            href={`/time-tracking?add=1&project=${filterProject}`}
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-gray-800"
          >
            <Plus className="w-4 h-4" /> Log Time
          </a>
        )}
      </div>

      {showAdd && (
        <form
          action={createTimeEntryGlobalAction}
          className="bg-white border border-gray-200 rounded-sm p-5 mb-6 grid grid-cols-4 gap-3 items-end"
        >
          <div className="col-span-4 flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-gray-900">Log Time</span>
            <a
              href={`/time-tracking?project=${filterProject}`}
              className="text-xs text-gray-500 hover:text-gray-900"
            >
              Cancel
            </a>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Project *</label>
            <select
              name="project_id"
              required
              defaultValue={filterProject !== "all" ? filterProject : ""}
              className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm"
            >
              <option value="">Select project…</option>
              {(projects ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} — {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Duration (min) *</label>
            <input
              name="minutes"
              type="number"
              required
              min="1"
              defaultValue="60"
              className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Date</label>
            <input
              name="start_at"
              type="datetime-local"
              className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Note</label>
            <input
              name="note"
              className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm"
              placeholder="Design review, site visit…"
            />
          </div>
          <div className="col-span-3" />
          <button
            type="submit"
            className="bg-gray-900 text-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-gray-800"
          >
            Log Time
          </button>
        </form>
      )}

      {/* Per-project summary */}
      {byProject.size > 1 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
          {Array.from(byProject.entries()).map(([pid, mins]) => {
            const p = projectMap.get(pid)
            return (
              <a
                key={pid}
                href={`/time-tracking?project=${pid}`}
                className={`border rounded-sm p-3 text-xs hover:bg-gray-50 ${
                  filterProject === pid
                    ? "border-gray-900 bg-gray-50"
                    : "border-gray-100 bg-white"
                }`}
              >
                <p className="font-mono text-gray-500">{p?.code ?? pid.slice(0, 6)}</p>
                <p className="font-semibold text-gray-900 mt-0.5">
                  {(mins / 60).toFixed(1)} h
                </p>
              </a>
            )
          })}
        </div>
      )}

      {/* Filter by project */}
      {projects && projects.length > 0 && (
        <div className="flex gap-1 mb-4 flex-wrap">
          <a
            href="/time-tracking"
            className={`px-3 py-1.5 text-xs rounded-sm font-medium ${
              filterProject === "all"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All
          </a>
          {projects.map((p) => (
            <a
              key={p.id}
              href={`/time-tracking?project=${p.id}`}
              className={`px-3 py-1.5 text-xs rounded-sm font-medium ${
                filterProject === p.id
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {p.code}
            </a>
          ))}
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-[11px] uppercase text-gray-500 tracking-wider">
            <tr>
              <th className="text-left px-4 py-2.5">Start</th>
              <th className="text-left px-4 py-2.5">Project</th>
              <th className="text-left px-4 py-2.5">Note</th>
              <th className="text-right px-4 py-2.5">
                <Clock className="w-3.5 h-3.5 inline" />
              </th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {entries?.map((e) => {
              const p = projectMap.get(e.project_id as string)
              const deleteAction = deleteTimeEntryGlobalAction.bind(
                null,
                e.id,
              )
              return (
                <tr key={e.id} className="hover:bg-gray-50 group">
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {e.start_at
                      ? new Date(e.start_at as string).toLocaleString("vi-VN", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    {p ? `${p.code} — ${p.name}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {(e.note as string) ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">
                    {(Number(e.minutes ?? 0) / 60).toFixed(1)}h
                  </td>
                  <td className="px-2">
                    <form action={deleteAction}>
                      <button
                        type="submit"
                        className="p-1 text-gray-200 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </td>
                </tr>
              )
            })}
            {(!entries || entries.length === 0) && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-gray-400"
                >
                  No time entries yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
