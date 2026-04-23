import Link from "next/link"
import { FileText, Calendar, LayoutGrid, Trash2 } from "lucide-react"
import { deleteModuleAction } from "./actions"
import { NewModuleDialog } from "./new-module-dialog"

type Mod = {
  id: string
  project_id: string
  kind: "document" | "schedule"
  schedule_kind: "ffne" | "gantt" | "generic" | null
  name: string
  status: "draft" | "active" | "archived"
  updated_at: string | null
}

function formatRelative(dateStr: string | null): string {
  if (!dateStr) return "\u2014"
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return new Date(dateStr).toLocaleDateString("vi-VN")
}

function ModuleIcon({ mod }: { mod: Mod }) {
  if (mod.kind === "document") return <FileText className="w-4 h-4 text-gray-400" />
  if (mod.schedule_kind === "ffne") return <LayoutGrid className="w-4 h-4 text-gray-400" />
  return <Calendar className="w-4 h-4 text-gray-400" />
}

export function ActiveModulesTable({
  projectId,
  modules,
}: {
  projectId: string
  modules: Mod[]
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Active Modules
        </h2>
        <NewModuleDialog projectId={projectId} />
      </div>
      <div className="border border-gray-100 rounded-sm overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-[10px] uppercase tracking-wider text-gray-500">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Name</th>
              <th className="text-left px-4 py-2 font-medium">Status</th>
              <th className="text-right px-4 py-2 font-medium">Modified</th>
              <th className="w-10 px-2 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {modules.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-sm text-gray-400">
                  Chưa có module nào. Bấm + New module để tạo Document hoặc Schedule.
                </td>
              </tr>
            ) : (
              modules.map((m) => {
                const del = deleteModuleAction.bind(null, m.id, projectId)
                const statusCls =
                  m.status === "active"
                    ? "bg-gray-900 text-white"
                    : m.status === "draft"
                    ? "bg-gray-100 text-gray-700"
                    : "bg-gray-100 text-gray-400"
                return (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/projects/${projectId}?module=${m.id}`}
                        className="inline-flex items-center gap-2 text-gray-900 hover:text-black"
                      >
                        <ModuleIcon mod={m} />
                        <span className="font-medium">{m.name || "Untitled"}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${statusCls}`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-gray-500">
                      {formatRelative(m.updated_at)}
                    </td>
                    <td className="px-2 py-3 text-right">
                      <form action={del}>
                        <button
                          type="submit"
                          className="text-gray-400 hover:text-red-600 p-1"
                          aria-label="Delete module"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
