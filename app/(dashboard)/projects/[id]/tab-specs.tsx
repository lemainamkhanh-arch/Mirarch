import { createSpecAction, deleteSpecAction } from "./actions"
import { StatusDropdown } from "./status-dropdown"

type Spec = {
  id: string
  name: string
  room: string | null
  quantity: number | null
  unit_price: number | null
  status: string
}

export function SpecsTab({ projectId, specs }: { projectId: string; specs: Spec[] }) {
  const createAction = createSpecAction.bind(null, projectId)
  const byRoom: Record<string, Spec[]> = {}
  for (const s of specs) {
    const room = s.room || "Unassigned"
    if (!byRoom[room]) byRoom[room] = []
    byRoom[room].push(s)
  }

  const fmt = (n: number | null) =>
    n ? new Intl.NumberFormat("vi-VN").format(n) : "—"

  return (
    <div>
      <form action={createAction} className="grid grid-cols-6 gap-2 mb-6 p-4 border rounded-md bg-gray-50">
        <input name="name" placeholder="Item name" required className="col-span-2 border border-gray-300 rounded-md px-3 py-2 text-sm bg-white" />
        <input name="room" placeholder="Room" className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white" />
        <input name="quantity" type="number" placeholder="Qty" defaultValue="1" className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white" />
        <input name="unit_price" type="number" placeholder="Unit price (VND)" className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white" />
        <button type="submit" className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium">
          Add Item
        </button>
      </form>

      {Object.keys(byRoom).length === 0 ? (
        <div className="text-center py-12 text-sm text-gray-500">No FF&E items yet. Add your first item above.</div>
      ) : (
        <div className="space-y-6">
          {Object.entries(byRoom).map(([room, items]) => (
            <div key={room}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">
                {room} <span className="text-gray-400 font-normal">({items.length})</span>
              </h3>
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium">Item</th>
                      <th className="text-right px-3 py-2 font-medium">Qty</th>
                      <th className="text-right px-3 py-2 font-medium">Unit Price</th>
                      <th className="text-right px-3 py-2 font-medium">Total</th>
                      <th className="text-left px-3 py-2 font-medium">Status</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {items.map((s) => {
                      const del = deleteSpecAction.bind(null, s.id, projectId)
                      const total = (s.quantity || 0) * (s.unit_price || 0)
                      return (
                        <tr key={s.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2">{s.name}</td>
                          <td className="px-3 py-2 text-right">{s.quantity ?? "—"}</td>
                          <td className="px-3 py-2 text-right">{fmt(s.unit_price)}</td>
                          <td className="px-3 py-2 text-right font-medium">{fmt(total)}</td>
                          <td className="px-3 py-2">
                            <StatusDropdown specId={s.id} projectId={projectId} currentStatus={s.status} />
                          </td>
                          <td className="px-3 py-2 text-right">
                            <form action={del}>
                              <button type="submit" className="text-xs text-gray-400 hover:text-red-600">×</button>
                            </form>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
