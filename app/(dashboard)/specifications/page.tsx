import { redirect } from "next/navigation"
import { Plus, Trash2, AlertTriangle } from "lucide-react"
import { getCurrentContext } from "@/lib/supabase/current-studio"
import {
  createSpecGlobalAction,
  deleteSpecGlobalAction,
  updateSpecStatusGlobalAction,
} from "./actions"
import { StatusSelect } from "./status-select"

export const dynamic = "force-dynamic"

type Spec = Record<string, unknown>

function isLeadTimeOverdue(spec: Spec): boolean {
  const installDate = spec.install_date as string | null
  const leadTimeDays = spec.lead_time_days as number | null
  if (!installDate || spec.status === "delivered" || spec.status === "installed")
    return false
  const deadlineMs = new Date(installDate).getTime()
  const orderByMs = deadlineMs - (leadTimeDays ?? 0) * 86400000
  return orderByMs <= Date.now()
}

export default async function SpecificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ add?: string }>
}) {
  const { supabase, user, studioId } = await getCurrentContext()
  if (!user) redirect("/login")
  if (!studioId) redirect("/onboarding")

  const sp = await searchParams
  const showAdd = sp.add === "1"

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, code")
    .eq("studio_id", studioId)
    .order("name")

  const projectMap = new Map(((projects ?? []) as any[]).map((p) => [p.id, p]))
  const projectIds = ((projects ?? []) as any[]).map((p) => p.id)

  const { data: specs } = await supabase
    .from("specifications")
    .select("*")
    .in(
      "project_id",
      projectIds.length ? projectIds : ["00000000-0000-0000-0000-000000000000"],
    )
    .order("created_at", { ascending: false })

  const totalValue = ((specs ?? []) as any[]).reduce(
    (s: number, r: any) =>
      s + Number(r.quantity ?? 1) * Number(r.unit_price ?? 0),
    0,
  )

  const overdueCount = ((specs ?? []) as any[]).filter((s) => isLeadTimeOverdue(s as Spec)).length

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Specifications</h1>
          <p className="text-sm text-gray-500">
            FF&amp;E across all projects ·{" "}
            <span className="font-medium text-gray-700">
              {new Intl.NumberFormat("vi-VN").format(totalValue)} VND
            </span>
            {overdueCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 text-red-600 font-medium">
                <AlertTriangle className="w-3.5 h-3.5" />
                {overdueCount} quá lead time
              </span>
            )}
          </p>
        </div>
        {!showAdd && (
          <a
            href="/specifications?add=1"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-gray-800"
          >
            <Plus className="w-4 h-4" /> Thêm mục
          </a>
        )}
      </div>

      {showAdd && (
        <form
          action={createSpecGlobalAction}
          className="bg-white border border-gray-200 rounded-sm p-5 mb-6 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">Mục FF&amp;E mới</span>
            <a href="/specifications" className="text-xs text-gray-500 hover:text-gray-900">
              Huỷ
            </a>
          </div>
          <div className="grid grid-cols-5 gap-3 items-end">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Dự án *</label>
              <select
                name="project_id"
                required
                className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm"
              >
                {((projects ?? []) as any[]).map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.code}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Phòng</label>
              <input
                name="room"
                className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm"
                placeholder="Phòng khách"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-500 block mb-1">Tên mục *</label>
              <input
                name="name"
                required
                className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm"
                placeholder="Sofa 3-seater — Cassina"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Số lượng</label>
              <input
                name="quantity"
                type="number"
                defaultValue="1"
                min="1"
                className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3 items-end">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Đơn giá (VND)</label>
              <input
                name="unit_price"
                type="number"
                defaultValue="0"
                className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Lead time (ngày)</label>
              <input
                name="lead_time_days"
                type="number"
                min="0"
                placeholder="30"
                className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Ngày lắp đặt</label>
              <input
                name="install_date"
                type="date"
                className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm"
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full bg-gray-900 text-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-gray-800"
              >
                Thêm
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="bg-white border border-gray-100 rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-[11px] uppercase text-gray-500 tracking-wider">
            <tr>
              <th className="text-left px-4 py-2.5">Dự án</th>
              <th className="text-left px-4 py-2.5">Phòng</th>
              <th className="text-left px-4 py-2.5">Mục</th>
              <th className="text-right px-4 py-2.5">SL</th>
              <th className="text-right px-4 py-2.5">Đơn giá</th>
              <th className="text-right px-4 py-2.5">Thành tiền</th>
              <th className="text-left px-4 py-2.5">Lead time</th>
              <th className="text-left px-4 py-2.5">Trạng thái</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {((specs ?? []) as Spec[]).map((s) => {
              const p = projectMap.get(s.project_id as string)
              const updateAction = updateSpecStatusGlobalAction.bind(null, s.id as string)
              const deleteAction = deleteSpecGlobalAction.bind(null, s.id as string)
              const qty = Number(s.quantity ?? 1)
              const price = Number(s.unit_price ?? 0)
              const overdue = isLeadTimeOverdue(s)
              const leadTimeDays = s.lead_time_days as number | null
              const installDate = s.install_date as string | null

              return (
                <tr
                  key={s.id as string}
                  className={`hover:bg-gray-50 group ${overdue ? "bg-red-50" : ""}`}
                >
                  <td className="px-4 py-3 text-gray-600 text-xs font-mono">
                    {p?.code ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {(s.room as string) ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    <div className="flex items-center gap-1.5">
                      {s.name as string}
                      {overdue && (
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">{qty}</td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {price ? new Intl.NumberFormat("vi-VN").format(price) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    {qty * price
                      ? new Intl.NumberFormat("vi-VN").format(qty * price)
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {leadTimeDays != null ? (
                      <span className={overdue ? "text-red-600 font-medium" : ""}>
                        {leadTimeDays}d
                        {installDate && (
                          <span className="block text-gray-400">
                            →{" "}
                            {new Date(installDate).toLocaleDateString("vi-VN", {
                              day: "2-digit",
                              month: "2-digit",
                            })}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <form action={updateAction}>
                      <StatusSelect status={s.status as string} />
                    </form>
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
            {(!specs || specs.length === 0) && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-gray-400">
                  Chưa có mục nào.{" "}
                  <a
                    href="/specifications?add=1"
                    className="underline text-gray-600"
                  >
                    Thêm mục đầu tiên.
                  </a>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
