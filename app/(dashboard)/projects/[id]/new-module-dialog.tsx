"use client"

import { useState, useTransition } from "react"
import { Plus } from "lucide-react"
import { createModuleAction } from "./actions"

export function NewModuleDialog({
  projectId,
  compact = false,
}: {
  projectId: string
  compact?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [kind, setKind] = useState<"document" | "schedule">("document")
  const [scheduleKind, setScheduleKind] =
    useState<"ffne" | "gantt" | "generic">("ffne")
  const [name, setName] = useState("")
  const [pending, startTransition] = useTransition()

  const triggerCls = compact
    ? "inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 px-2 py-1 whitespace-nowrap"
    : "inline-flex items-center gap-1 bg-gray-900 text-white px-3 py-1.5 rounded-sm text-xs font-medium hover:bg-gray-800"

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerCls}>
        <Plus className="w-3.5 h-3.5" /> New module
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-md shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-1">New module</h3>
            <p className="text-xs text-gray-500 mb-4">
              Chọn loại module bạn muốn thêm vào dự án.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const fd = new FormData()
                fd.set("kind", kind)
                fd.set(
                  "name",
                  name.trim() || (kind === "document" ? "Untitled" : "Schedule"),
                )
                if (kind === "schedule") fd.set("schedule_kind", scheduleKind)
                startTransition(async () => {
                  await createModuleAction(projectId, fd)
                })
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Loại
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["document", "schedule"] as const).map((k) => (
                    <button
                      type="button"
                      key={k}
                      onClick={() => setKind(k)}
                      className={`border rounded-sm px-3 py-2 text-sm ${
                        kind === k
                          ? "border-gray-900 bg-gray-50 font-medium"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      {k === "document" ? "Document" : "Schedule"}
                    </button>
                  ))}
                </div>
              </div>
              {kind === "schedule" && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Kiểu Schedule
                  </label>
                  <select
                    value={scheduleKind}
                    onChange={(e) =>
                      setScheduleKind(
                        e.target.value as "ffne" | "gantt" | "generic",
                      )
                    }
                    className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm"
                  >
                    <option value="ffne">FF&E Schedule</option>
                    <option value="gantt">Gantt / Timeline</option>
                    <option value="generic">Generic Database</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Tên
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={
                    kind === "document"
                      ? "Presentation, Concept Brief, ..."
                      : "Furniture Schedule, ..."
                  }
                  className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-gray-900"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="px-4 py-2 bg-gray-900 text-white rounded-sm text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
                >
                  {pending ? "Creating\u2026" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
