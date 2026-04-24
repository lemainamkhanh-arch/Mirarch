import { AlertTriangle, ImageOff } from "lucide-react"
import { getCurrentContext } from "@/lib/supabase/current-studio"
import { AutoSubmitSelect } from "./auto-submit-select"
import {
  addFurnitureRoomAction,
  addFurnitureItemAction,
  updateFurnitureItemStatusAction,
  updateFurnitureClientApprovalAction,
  deleteFurnitureItemAction,
  deleteFurnitureRoomAction,
} from "./actions"

const STATUS_FLOW = [
  "proposed",
  "client_review",
  "approved",
  "ordered",
  "in_transit",
  "delivered",
  "installed",
] as const

const STATUS_LABEL: Record<string, string> = {
  proposed: "Proposed",
  client_review: "Client review",
  approved: "Approved",
  ordered: "Ordered",
  in_transit: "In transit",
  delivered: "Delivered",
  installed: "Installed",
}

const STATUS_COLOR: Record<string, string> = {
  proposed: "bg-gray-100 text-gray-700",
  client_review: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  ordered: "bg-blue-100 text-blue-800",
  in_transit: "bg-indigo-100 text-indigo-800",
  delivered: "bg-violet-100 text-violet-800",
  installed: "bg-green-100 text-green-900",
}

const APPROVAL_COLOR: Record<string, string> = {
  pending: "bg-gray-100 text-gray-600",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-rose-100 text-rose-800",
}

function formatMoney(n: number | null | undefined, currency: string) {
  if (n == null) return "—"
  try {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency }).format(n)
  } catch {
    return `${n.toLocaleString("vi-VN")} ${currency}`
  }
}

type Item = {
  id: string
  room_id: string | null
  name: string
  description: string | null
  image_url: string | null
  sku: string | null
  supplier: string | null
  quantity: number
  unit: string | null
  unit_price: number | null
  currency: string
  lead_time_days: number | null
  order_date: string | null
  expected_delivery: string | null
  actual_delivery: string | null
  status: string
  client_approval: string
  client_approval_note: string | null
  position: number
  created_at: string
}

type Room = { id: string; name: string; position: number }

const UNCLASSIFIED_ROOM: Room = { id: "", name: "Không phân loại", position: 999 }

export async function FurnitureScheduleView({
  projectId,
  moduleId,
}: {
  projectId: string
  moduleId: string
}) {
  const { supabase } = await getCurrentContext()

  const [{ data: rooms }, { data: items }] = await Promise.all([
    supabase
      .from("furniture_rooms")
      .select("id,name,position")
      .eq("module_id", moduleId)
      .order("position", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("furniture_items")
      .select(
        "id,room_id,name,description,image_url,sku,supplier,quantity,unit,unit_price,currency,lead_time_days,order_date,expected_delivery,actual_delivery,status,client_approval,client_approval_note,position,created_at",
      )
      .eq("module_id", moduleId)
      .order("position", { ascending: true })
      .order("created_at", { ascending: true }),
  ])

  const roomList = (rooms ?? []) as Room[]
  const itemList = (items ?? []) as Item[]

  const today = new Date().toISOString().slice(0, 10)
  const totalCount = itemList.length
  const totalValue = itemList.reduce(
    (s, it) => s + (Number(it.unit_price) || 0) * (Number(it.quantity) || 0),
    0,
  )
  const overdueCount = itemList.filter(
    (it) =>
      it.expected_delivery &&
      it.expected_delivery < today &&
      !["delivered", "installed"].includes(it.status),
  ).length
  const pendingApprovalCount = itemList.filter(
    (it) => it.client_approval === "pending",
  ).length

  const addRoom = addFurnitureRoomAction.bind(null, moduleId, projectId)

  const grouped = new Map<string, Item[]>()
  grouped.set("__none__", [])
  for (const r of roomList) grouped.set(r.id, [])
  for (const it of itemList) {
    const key = it.room_id && grouped.has(it.room_id) ? it.room_id : "__none__"
    grouped.get(key)!.push(it)
  }

  const currency = itemList[0]?.currency ?? "VND"
  const unclassified = grouped.get("__none__") ?? []

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-3">
        <SummaryCard label="Items" value={String(totalCount)} />
        <SummaryCard label="Tổng giá trị" value={formatMoney(totalValue, currency)} />
        <SummaryCard
          label="Chờ duyệt"
          value={String(pendingApprovalCount)}
          tone={pendingApprovalCount > 0 ? "warn" : undefined}
        />
        <SummaryCard
          label="Trễ hạn"
          value={String(overdueCount)}
          tone={overdueCount > 0 ? "danger" : undefined}
        />
      </div>

      <form action={addRoom} className="flex items-center gap-2">
        <input
          name="name"
          placeholder="Tên phòng (VD: Living room, Master bedroom...)"
          className="text-sm border border-gray-200 rounded-sm px-3 py-1.5 w-72 focus:outline-none focus:border-gray-900"
        />
        <button
          type="submit"
          className="text-xs px-3 py-1.5 bg-gray-900 text-white rounded-sm hover:bg-gray-700"
        >
          + Thêm phòng
        </button>
      </form>

      {roomList.length === 0 && unclassified.length === 0 && (
        <div className="border border-dashed border-gray-200 rounded-sm p-10 text-center text-sm text-gray-500">
          Chưa có phòng nào. Tạo phòng đầu tiên để bắt đầu liệt kê furniture.
        </div>
      )}

      {roomList.map((room) => (
        <RoomBlock
          key={room.id}
          room={room}
          items={grouped.get(room.id) ?? []}
          projectId={projectId}
          moduleId={moduleId}
          today={today}
        />
      ))}

      {unclassified.length > 0 && (
        <RoomBlock
          room={UNCLASSIFIED_ROOM}
          items={unclassified}
          projectId={projectId}
          moduleId={moduleId}
          today={today}
          noRoom
        />
      )}
    </div>
  )
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: "warn" | "danger"
}) {
  const toneClass =
    tone === "danger"
      ? "border-rose-200 bg-rose-50"
      : tone === "warn"
      ? "border-amber-200 bg-amber-50"
      : "border-gray-200 bg-white"
  return (
    <div className={`border rounded-sm px-3 py-2 ${toneClass}`}>
      <div className="text-[10px] uppercase tracking-wider text-gray-500">{label}</div>
      <div className="text-lg font-semibold text-gray-900 tabular-nums">{value}</div>
    </div>
  )
}

function RoomBlock({
  room,
  items,
  projectId,
  moduleId,
  today,
  noRoom,
}: {
  room: Room
  items: Item[]
  projectId: string
  moduleId: string
  today: string
  noRoom?: boolean
}) {
  const addItem = addFurnitureItemAction.bind(
    null,
    moduleId,
    projectId,
    noRoom ? null : room.id,
  )
  const delRoom = deleteFurnitureRoomAction.bind(null, room.id, projectId)

  const subtotal = items.reduce(
    (s, it) => s + (Number(it.unit_price) || 0) * (Number(it.quantity) || 0),
    0,
  )
  const currency = items[0]?.currency ?? "VND"

  return (
    <section className="border border-gray-200 rounded-sm">
      <header className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">{room.name}</span>
          <span className="text-xs text-gray-500">
            {items.length} items {subtotal > 0 ? `· ${formatMoney(subtotal, currency)}` : ""}
          </span>
        </div>
        {!noRoom && (
          <form action={delRoom}>
            <button className="text-[11px] text-gray-400 hover:text-red-600">
              Xoá phòng
            </button>
          </form>
        )}
      </header>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500">
            <tr>
              <th className="text-left px-3 py-2 w-12">Ảnh</th>
              <th className="text-left px-3 py-2">Item</th>
              <th className="text-left px-3 py-2">Supplier</th>
              <th className="text-right px-3 py-2">Qty</th>
              <th className="text-right px-3 py-2">Unit price</th>
              <th className="text-right px-3 py-2">Total</th>
              <th className="text-left px-3 py-2">Lead / ETA</th>
              <th className="text-left px-3 py-2">Status</th>
              <th className="text-left px-3 py-2">Client</th>
              <th className="px-3 py-2 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={10} className="px-3 py-4 text-center text-xs text-gray-400">
                  Chưa có item. Thêm ở dưới.
                </td>
              </tr>
            )}
            {items.map((it) => {
              const total = (Number(it.unit_price) || 0) * (Number(it.quantity) || 0)
              const overdue =
                it.expected_delivery &&
                it.expected_delivery < today &&
                !["delivered", "installed"].includes(it.status)
              const setStatus = updateFurnitureItemStatusAction.bind(null, it.id, projectId)
              const setApproval = updateFurnitureClientApprovalAction.bind(null, it.id, projectId)
              const delItem = deleteFurnitureItemAction.bind(null, it.id, projectId)
              return (
                <tr key={it.id} className="border-t border-gray-100 hover:bg-gray-50/60">
                  <td className="px-3 py-2">
                    {it.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={it.image_url}
                        alt=""
                        className="w-10 h-10 object-cover rounded-sm border border-gray-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-sm border border-dashed border-gray-200 flex items-center justify-center text-gray-300">
                        <ImageOff className="w-4 h-4" />
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium text-gray-900">{it.name}</div>
                    {it.sku && (
                      <div className="text-[11px] text-gray-400">SKU {it.sku}</div>
                    )}
                  </td>
                  <td className="px-3 py-2 text-gray-600">{it.supplier ?? "—"}</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {it.quantity} {it.unit || ""}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {formatMoney(it.unit_price, it.currency)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums font-medium">
                    {formatMoney(total, it.currency)}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      {it.lead_time_days != null && (
                        <span className="text-[11px] text-gray-500">
                          {it.lead_time_days}d
                        </span>
                      )}
                      {it.expected_delivery && (
                        <span
                          className={`text-[11px] ${
                            overdue ? "text-rose-600 font-medium" : "text-gray-500"
                          }`}
                        >
                          · {it.expected_delivery}
                        </span>
                      )}
                      {overdue && <AlertTriangle className="w-3 h-3 text-rose-600" />}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <form action={setStatus}>
                      <AutoSubmitSelect
                        name="status"
                        defaultValue={it.status}
                        options={STATUS_FLOW.map((s) => ({ value: s, label: STATUS_LABEL[s] }))}
                        className={`text-[11px] px-1.5 py-0.5 rounded-sm border-0 focus:outline-none focus:ring-1 focus:ring-gray-400 ${STATUS_COLOR[it.status] ?? ""}`}
                      />
                    </form>
                  </td>
                  <td className="px-3 py-2">
                    <form action={setApproval}>
                      <AutoSubmitSelect
                        name="client_approval"
                        defaultValue={it.client_approval}
                        options={[
                          { value: "pending", label: "Pending" },
                          { value: "approved", label: "Approved" },
                          { value: "rejected", label: "Rejected" },
                        ]}
                        className={`text-[11px] px-1.5 py-0.5 rounded-sm border-0 focus:outline-none focus:ring-1 focus:ring-gray-400 ${APPROVAL_COLOR[it.client_approval] ?? ""}`}
                      />
                    </form>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <form action={delItem}>
                      <button className="text-[11px] text-gray-300 hover:text-red-600">✕</button>
                    </form>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {!noRoom && (
        <form
          action={addItem}
          className="grid grid-cols-12 gap-2 px-3 py-2 border-t border-gray-100 bg-gray-50/60"
        >
          <input
            name="name"
            placeholder="Tên item (bắt buộc)"
            className="col-span-3 text-xs border border-gray-200 rounded-sm px-2 py-1 focus:outline-none focus:border-gray-900"
          />
          <input
            name="supplier"
            placeholder="Supplier"
            className="col-span-2 text-xs border border-gray-200 rounded-sm px-2 py-1 focus:outline-none focus:border-gray-900"
          />
          <input
            name="quantity"
            type="number"
            min={1}
            defaultValue={1}
            className="col-span-1 text-xs border border-gray-200 rounded-sm px-2 py-1 focus:outline-none focus:border-gray-900"
          />
          <input
            name="unit_price"
            type="number"
            placeholder="Đơn giá"
            className="col-span-2 text-xs border border-gray-200 rounded-sm px-2 py-1 focus:outline-none focus:border-gray-900"
          />
          <input
            name="lead_time_days"
            type="number"
            placeholder="Lead days"
            className="col-span-1 text-xs border border-gray-200 rounded-sm px-2 py-1 focus:outline-none focus:border-gray-900"
          />
          <input
            name="expected_delivery"
            type="date"
            className="col-span-2 text-xs border border-gray-200 rounded-sm px-2 py-1 focus:outline-none focus:border-gray-900"
          />
          <button
            type="submit"
            className="col-span-1 text-xs bg-gray-900 text-white rounded-sm hover:bg-gray-700"
          >
            + Add
          </button>
        </form>
      )}
    </section>
  )
}
