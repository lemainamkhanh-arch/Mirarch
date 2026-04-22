import { redirect } from "next/navigation"
import { Plus, Trash2 } from "lucide-react"
import { getCurrentContext } from "@/lib/supabase/current-studio"
import {
  createSpecGlobalAction,
  deleteSpecGlobalAction,
  updateSpecStatusGlobalAction,
} from "./actions"

export const dynamic = "force-dynamic"

const SPEC_STATUSES = [
  "specified",
  "quoted",
  "client_approved",
  "ordered",
  "in_transit",
  "delivered",
  "installed",
]

const SPEC_STATUS_COLOR: Record<string, string> = {
  specified: "bg-gray-100 text-gray-600",
  quoted: "bg-yellow-100 text-yellow-700",
  client_approved: "bg-blue-100 text-blue-700",
  ordered: "bg-purple-100 text-purple-700",
  in_transit: "bg-orange-100 text-orange-700",
  delivered: "bg-teal-100 text-teal-700",
  installed: "bg-green-100 text-green-700",
}

type Spec = Record<string, unknown>

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

  const projectMap = new Map((projects ?? []).map((p) => [p.id, p]))
  const projectIds = (projects ?? []).map((p) => p.id)

  const { data: specs } = await supabase
    .from("specifications")
    .select("*")
    .in(
      "project_id",
      projectIds.length ? projectIds : ["00000000-0000-0000-0000-000000000000"],
    )
    .order("created_at", { ascending: false })

  const totalValue = (specs ?? []).reduce(
    (s: number, r: Spec) => s + Number(r.quantity ?? 1) * Number(r.unit_price ?? 0),
    0,
  )

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Specifications</h1>
          <p className="text-sm text-gray-500">
            FF&amp;E across all projects —{" "}
            <span className="font-medium text-gray-700">
              {new Intl.NumberFormat("vi-VN").format(totalValue)} VND total
            </span>
          </p>
        </div>
        {!showAdd && (
          <a
            href="/specifications?add=1"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-gray-800"
          >
            <Plus className="w-4 h-4" /> Add Item
          </a>
        )}
      </div>

      {showAdd && (
        <form
          action={createSpecGlobalAction}
          className="bg-white border border-gray-200 rounded-sm p-5 mb-6 grid grid-cols-5 gap-3 items-end"
        >
          <div className="col-span-5 flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-gray-900">New Specification Item</span>
            <a href="/specifications" className="text-xs text-gray-500 hover:text-gray-900">
              Cancel
            </a>
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
                  {p.code}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Room</label>
            <input
              name="room"
              className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm"
              placeholder="Living Room"
            />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-gray-500 block mb-1">Item Name *</label>
            <input
              name="name"
              required
              className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm"
              placeholder="Sofa 3-seater — Cassina"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Qty</label>
            <input
              name="quantity"
              type="number"
              defaultValue="1"
              min="1"
              className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Unit Price (VND)</label>
            <input
              name="unit_price"
              type="number"
              defaultValue="0"
              className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm"
            />
          </div>
          <div className="col-span-4" />
          <button
            type="submit"
            className="bg-gray-900 text-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-gray-800"
          >
            Add Item
          </button>
        </form>
      )}

      <div className="bg-white border border-gray-100 rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-[11px] uppercase text-gray-500 tracking-wider">
            <tr>
              <th className="text-left px-4 py-2.5">Project</th>
              <th className="text-left px-4 py-2.5">Room</th>
              <th className="text-left px-4 py-2.5">Item</th>
              <th className="text-right px-4 py-2.5">Qty</th>
              <th className="text-right px-4 py-2.5">Unit Price</th>
              <th className="text-right px-4 py-2.5">Total</th>
              <th className="text-left px-4 py-2.5">Status</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(specs as Spec[])?.map((s) => {
              const p = projectMap.get(s.project_id as string)
              const updateAction = updateSpecStatusGlobalAction.bind(
                null,
                s.id as string,
              )
              const deleteAction = deleteSpecGlobalAction.bind(
                null,
                s.id as string,
              )
              const qty = Number(s.quantity ?? 1)
              const price = Number(s.unit_price ?? 0)
              return (
                <tr key={s.id as string} className="hover:bg-gray-50 group">
                  <td className="px-4 py-3 text-gray-600 text-xs font-mono">
                    {p?.code ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {(s.room as string) ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-900">{s.name as string}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{qty}</td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {price
                      ? new Intl.NumberFormat("vi-VN").format(price)
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    {qty * price
                      ? new Intl.NumberFormat("vi-VN").format(qty * price)
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <form action={updateAction}>
                      <select
                        name="status"
                        defaultValue={s.status as string}
                        onChange="this.form.requestSubmit()"
                        className={`text-[11px] font-medium px-2 py-0.5 rounded border-0 cursor-pointer ${
                          SPEC_STATUS_COLOR[s.status as string] ?? "bg-gray-100"
                        }`}
                      >
                        {SPEC_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st.replace("_", " ")}
                          </option>
                        ))}
                      </select>
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
                <td
                  colSpan={8}
                  className="px-4 py-10 text-center text-gray-400"
                >
                  No specifications yet.{" "}
                  <a
                    href="/specifications?add=1"
                    className="underline text-gray-600"
                  >
                    Add first item.
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
