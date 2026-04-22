import { createTimeEntryAction, deleteTimeEntryAction } from "./actions"

type Entry = {
  id: string
  start_at: string
  minutes: number | null
  note: string | null
}

export function TimeTab({ projectId, entries }: { projectId: string; entries: Entry[] }) {
  const createAction = createTimeEntryAction.bind(null, projectId)
  const totalMinutes = entries.reduce((s, e) => s + (e.minutes || 0), 0)

  return (
    <div>
      <form action={createAction} className="grid grid-cols-4 gap-2 mb-6 p-4 border rounded-md bg-gray-50">
        <input name="start_at" type="datetime-local" className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white" />
        <input name="minutes" type="number" placeholder="Minutes" required className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white" />
        <input name="note" placeholder="What did you do?" className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white" />
        <button type="submit" className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium">Log Time</button>
      </form>

      <div className="flex items-baseline justify-between mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Entries ({entries.length})</h3>
        <div className="text-sm text-gray-500">
          Total: <span className="font-medium text-gray-900">{(totalMinutes / 60).toFixed(1)}h</span>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-12 text-sm text-gray-500">No time logged yet.</div>
      ) : (
        <div className="border rounded-md divide-y">
          {entries.map((e) => {
            const del = deleteTimeEntryAction.bind(null, e.id, projectId)
            const dt = new Date(e.start_at).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })
            return (
              <div key={e.id} className="flex items-center gap-4 p-3">
                <div className="text-sm w-40 text-gray-500">{dt}</div>
                <div className="text-sm font-medium w-20">{((e.minutes || 0) / 60).toFixed(1)}h</div>
                <div className="flex-1 text-sm text-gray-700">{e.note || "—"}</div>
                <form action={del}>
                  <button type="submit" className="text-xs text-gray-400 hover:text-red-600">×</button>
                </form>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
