import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getCurrentContext } from '@/lib/supabase/current-studio'
import {
  createEstimateSectionAction,
  deleteEstimateSectionAction,
  createEstimateItemAction,
  deleteEstimateItemAction,
  updateEstimateStatusAction,
  pullSpecsIntoEstimateAction,
} from '../actions'

export const dynamic = 'force-dynamic'

const STATUS_COLOR: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  converted: 'bg-purple-100 text-purple-700',
}
const STATUS_LABEL: Record<string, string> = {
  draft: 'Nháp',
  sent: 'Đã gửi',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
  converted: 'Đã xuất HĐ',
}

type Section = { id: string; name: string; sort_order: number }
type Item = {
  id: string
  section_id: string | null
  description: string
  unit: string
  quantity: number
  unit_price: number
  markup_pct: number
}

export default async function EstimateDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ addSection?: string; addItem?: string; importFfe?: string }>
}) {
  const { id } = await params
  const sp = await searchParams
  const { supabase, studioId, user } = await getCurrentContext()
  if (!user) redirect('/login')

  const { data: estimate } = await supabase
    .from('estimates')
    .select('*, projects(id, code, name)')
    .eq('id', id)
    .eq('studio_id', studioId)
    .maybeSingle()

  if (!estimate) notFound()

  const [sectionsRes, itemsRes, specsRes] = await Promise.all([
    supabase
      .from('estimate_sections')
      .select('*')
      .eq('estimate_id', id)
      .order('sort_order'),
    supabase
      .from('estimate_items')
      .select('*')
      .eq('estimate_id', id)
      .order('section_id', { nullsFirst: false })
      .order('sort_order'),
    estimate.project_id
      ? supabase
          .from('specifications')
          .select('id, name, room, quantity, unit_price, markup_pct')
          .eq('project_id', estimate.project_id)
          .not('status', 'eq', 'installed')
          .order('room', { nullsFirst: false })
      : Promise.resolve({ data: [] }),
  ])

  const sections = (sectionsRes.data ?? []) as Section[]
  const items = (itemsRes.data ?? []) as Item[]
  const projectSpecs = (specsRes.data ?? []) as Array<{
    id: string; name: string; room: string | null; quantity: number; unit_price: number; markup_pct: number
  }>

  const subtotal = items.reduce(
    (s, i) => s + i.quantity * i.unit_price * (1 + i.markup_pct / 100),
    0,
  )
  const vatPct = estimate.vat_pct ?? 10
  const contingencyPct = estimate.contingency_pct ?? 0
  const vatAmount = subtotal * vatPct / 100
  const contingencyAmount = subtotal * contingencyPct / 100
  const total = subtotal + vatAmount + contingencyAmount

  const cur = estimate.currency ?? 'VND'
  const fmt = (n: number) =>
    new Intl.NumberFormat('vi-VN').format(Math.round(n)) + '\u00a0' + cur

  return (
    <div className="p-8 max-w-5xl">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-4">
        <Link href="/estimations" className="hover:text-gray-900">Dự toán</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{estimate.title}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">{estimate.title}</h1>
          {estimate.projects && (
            <Link href={`/projects/${estimate.projects.id}`} className="text-sm text-gray-500 hover:underline">
              {estimate.projects.code} · {estimate.projects.name}
            </Link>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className={'text-xs px-2.5 py-1 rounded-full ' + (STATUS_COLOR[estimate.status] ?? 'bg-gray-100 text-gray-700')}>
            {STATUS_LABEL[estimate.status] ?? estimate.status}
          </span>
          <form action={updateEstimateStatusAction.bind(null, id, estimate.status === 'draft' ? 'sent' : 'draft')}>
            <button type="submit" className="text-xs border border-gray-200 px-3 py-1.5 rounded-sm hover:bg-gray-50">
              {estimate.status === 'draft' ? '📤\u00a0Gửi khách' : '↩\u00a0Về nháp'}
            </button>
          </form>
          {estimate.status === 'sent' && (
            <form action={updateEstimateStatusAction.bind(null, id, 'approved')}>
              <button type="submit" className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-sm hover:bg-green-700">
                ✓\u00a0Đánh dấu duyệt
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="border rounded-md p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider">Tạm tính</div>
          <div className="text-xl font-semibold mt-1">{fmt(subtotal)}</div>
          <div className="text-xs text-gray-400 mt-0.5">{items.length} dòng</div>
        </div>
        <div className="border rounded-md p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider">
            VAT {vatPct}%{contingencyPct > 0 ? ` + Dự phòng ${contingencyPct}%` : ''}
          </div>
          <div className="text-xl font-semibold mt-1">{fmt(vatAmount + contingencyAmount)}</div>
        </div>
        <div className="border border-gray-900 rounded-md p-4 bg-gray-900 text-white">
          <div className="text-xs text-gray-400 uppercase tracking-wider">Tổng cộng</div>
          <div className="text-xl font-semibold mt-1">{fmt(total)}</div>
        </div>
      </div>

      {/* FF&E import banner — only when estimate has a project */}
      {estimate.project_id && projectSpecs.length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-sm p-4 mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-blue-900">
              Dự án có <strong>{projectSpecs.length}</strong> mục FF&amp;E chưa được nhập vào dự toán.
            </p>
            <p className="text-xs text-blue-600 mt-0.5">
              Tự động tạo nhóm theo phòng và sao chép giá + markup từ Specifications.
            </p>
          </div>
          <form action={pullSpecsIntoEstimateAction}>
            <input type="hidden" name="estimate_id" value={id} />
            <input type="hidden" name="project_id" value={estimate.project_id} />
            <button
              type="submit"
              className="shrink-0 bg-blue-600 text-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-blue-700"
            >
              ⬇️ Nhập FF&amp;E vào dự toán
            </button>
          </form>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
          Hạng mục ({sections.length} nhóm · {items.length} dòng)
        </h2>
        <div className="flex gap-2">
          <Link href={`?addSection=1`} className="text-xs text-gray-500 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded-sm hover:bg-gray-50">
            + Thêm nhóm
          </Link>
          {sections.length === 0 && (
            <Link href={`?addItem=__none__`} className="text-xs text-gray-500 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded-sm hover:bg-gray-50">
              + Thêm dòng nhanh
            </Link>
          )}
        </div>
      </div>

      {/* Add section form */}
      {sp.addSection === '1' && (
        <form action={createEstimateSectionAction} className="bg-gray-50 border border-gray-200 rounded-sm p-4 mb-4 flex gap-3 items-center">
          <input type="hidden" name="estimate_id" value={id} />
          <input
            name="name"
            placeholder="Tên nhóm (VD: Phòng khách, Thi công, Vật liệu…)"
            autoFocus
            className="flex-1 border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-gray-900"
          />
          <button type="submit" className="bg-gray-900 text-white px-4 py-2 rounded-sm text-sm">Thêm</button>
          <Link href={`/estimations/${id}`} className="px-4 py-2 rounded-sm text-sm text-gray-600 hover:bg-gray-100 border border-gray-200">Huỷ</Link>
        </form>
      )}

      {/* Empty state */}
      {sections.length === 0 && items.filter((i) => !i.section_id).length === 0 && sp.addItem !== '__none__' && (
        <div className="border border-dashed border-gray-200 rounded-sm p-10 text-center text-gray-400 text-sm">
          Chưa có hạng mục nào.{' '}
          <Link href="?addSection=1" className="underline">Thêm nhóm đầu tiên</Link>{' '}
          hoặc{' '}
          <Link href="?addItem=__none__" className="underline">thêm dòng nhanh</Link>.
        </div>
      )}

      {/* Sections */}
      {sections.map((section) => {
        const sItems = items.filter((i) => i.section_id === section.id)
        const sTotal = sItems.reduce((s, i) => s + i.quantity * i.unit_price * (1 + i.markup_pct / 100), 0)
        return (
          <div key={section.id} className="mb-6">
            <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-t-sm px-4 py-2.5">
              <span className="text-sm font-semibold text-gray-900">{section.name}</span>
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500">{fmt(sTotal)}</span>
                <form action={deleteEstimateSectionAction.bind(null, section.id, id)}>
                  <button type="submit" className="text-xs text-gray-300 hover:text-red-500">Xoá nhóm</button>
                </form>
              </div>
            </div>
            <div className="border border-t-0 border-gray-100 rounded-b-sm overflow-hidden">
              {sItems.length > 0 && (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-400 border-b border-gray-100 bg-white">
                      <th className="text-left px-4 py-2 font-medium">Mô tả</th>
                      <th className="text-right px-3 py-2 font-medium w-14">SL</th>
                      <th className="text-left px-3 py-2 font-medium w-12">ĐV</th>
                      <th className="text-right px-3 py-2 font-medium w-32">Đơn giá</th>
                      <th className="text-right px-3 py-2 font-medium w-16">Markup</th>
                      <th className="text-right px-3 py-2 font-medium w-36">Thành tiền</th>
                      <th className="w-8 px-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sItems.map((item) => {
                      const lineTotal = item.quantity * item.unit_price * (1 + item.markup_pct / 100)
                      return (
                        <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="px-4 py-2.5">{item.description}</td>
                          <td className="px-3 py-2.5 text-right text-gray-600">{item.quantity}</td>
                          <td className="px-3 py-2.5 text-gray-600">{item.unit}</td>
                          <td className="px-3 py-2.5 text-right text-gray-600">{new Intl.NumberFormat('vi-VN').format(item.unit_price)}</td>
                          <td className="px-3 py-2.5 text-right text-gray-600">{item.markup_pct > 0 ? `+${item.markup_pct}%` : '—'}</td>
                          <td className="px-3 py-2.5 text-right font-medium">{new Intl.NumberFormat('vi-VN').format(Math.round(lineTotal))}</td>
                          <td className="px-2 py-2.5">
                            <form action={deleteEstimateItemAction.bind(null, item.id, id)}>
                              <button type="submit" className="text-gray-300 hover:text-red-500 text-xs leading-none">✕</button>
                            </form>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
              {sp.addItem === section.id ? (
                <form action={createEstimateItemAction} className="flex items-end gap-2 p-3 bg-gray-50 border-t border-gray-100">
                  <input type="hidden" name="estimate_id" value={id} />
                  <input type="hidden" name="section_id" value={section.id} />
                  <div className="flex-1"><input name="description" placeholder="Mô tả" autoFocus className="w-full border border-gray-200 rounded-sm px-2 py-1.5 text-xs focus:outline-none focus:border-gray-900" /></div>
                  <input name="quantity" type="number" defaultValue="1" className="w-14 border border-gray-200 rounded-sm px-2 py-1.5 text-xs text-right" />
                  <input name="unit" defaultValue="cái" className="w-12 border border-gray-200 rounded-sm px-2 py-1.5 text-xs" />
                  <input name="unit_price" type="number" defaultValue="0" className="w-32 border border-gray-200 rounded-sm px-2 py-1.5 text-xs text-right" />
                  <input name="markup_pct" type="number" defaultValue="0" className="w-16 border border-gray-200 rounded-sm px-2 py-1.5 text-xs text-right" />
                  <button type="submit" className="bg-gray-900 text-white px-3 py-1.5 rounded-sm text-xs">Thêm</button>
                  <Link href={`/estimations/${id}`} className="text-xs text-gray-500 px-2 py-1.5">Huỷ</Link>
                </form>
              ) : (
                <div className="px-4 py-2.5 border-t border-gray-50">
                  <Link href={`?addItem=${section.id}`} className="text-xs text-gray-400 hover:text-gray-700">+ Thêm dòng</Link>
                </div>
              )}
            </div>
          </div>
        )
      })}

      {/* Items without section */}
      {(sp.addItem === '__none__' || items.filter((i) => !i.section_id).length > 0) && (
        <div className="mb-6">
          <div className="bg-gray-50 border border-gray-100 rounded-t-sm px-4 py-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Chung</span>
          </div>
          <div className="border border-t-0 border-gray-100 rounded-b-sm overflow-hidden">
            {items.filter((i) => !i.section_id).length > 0 && (
              <table className="w-full text-sm">
                <tbody>
                  {items.filter((i) => !i.section_id).map((item) => {
                    const lineTotal = item.quantity * item.unit_price * (1 + item.markup_pct / 100)
                    return (
                      <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-2.5">{item.description}</td>
                        <td className="px-3 py-2.5 text-right text-gray-600 w-14">{item.quantity}</td>
                        <td className="px-3 py-2.5 text-gray-600 w-12">{item.unit}</td>
                        <td className="px-3 py-2.5 text-right text-gray-600 w-32">{new Intl.NumberFormat('vi-VN').format(item.unit_price)}</td>
                        <td className="px-3 py-2.5 text-right text-gray-600 w-16">{item.markup_pct > 0 ? `+${item.markup_pct}%` : '—'}</td>
                        <td className="px-3 py-2.5 text-right font-medium w-36">{new Intl.NumberFormat('vi-VN').format(Math.round(lineTotal))}</td>
                        <td className="px-2 w-8">
                          <form action={deleteEstimateItemAction.bind(null, item.id, id)}>
                            <button type="submit" className="text-gray-300 hover:text-red-500 text-xs">✕</button>
                          </form>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
            {sp.addItem === '__none__' ? (
              <form action={createEstimateItemAction} className="flex items-end gap-2 p-3 bg-gray-50 border-t border-gray-100">
                <input type="hidden" name="estimate_id" value={id} />
                <div className="flex-1"><input name="description" placeholder="Mô tả" autoFocus className="w-full border border-gray-200 rounded-sm px-2 py-1.5 text-xs focus:outline-none focus:border-gray-900" /></div>
                <input name="quantity" type="number" defaultValue="1" className="w-14 border border-gray-200 rounded-sm px-2 py-1.5 text-xs text-right" />
                <input name="unit" defaultValue="cái" className="w-12 border border-gray-200 rounded-sm px-2 py-1.5 text-xs" />
                <input name="unit_price" type="number" defaultValue="0" className="w-32 border border-gray-200 rounded-sm px-2 py-1.5 text-xs text-right" />
                <input name="markup_pct" type="number" defaultValue="0" className="w-16 border border-gray-200 rounded-sm px-2 py-1.5 text-xs text-right" />
                <button type="submit" className="bg-gray-900 text-white px-3 py-1.5 rounded-sm text-xs">Thêm</button>
                <Link href={`/estimations/${id}`} className="text-xs text-gray-500 px-2 py-1.5">Huỷ</Link>
              </form>
            ) : (
              <div className="px-4 py-2.5">
                <Link href={`?addItem=__none__`} className="text-xs text-gray-400 hover:text-gray-700">+ Thêm dòng</Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Total summary */}
      {items.length > 0 && (
        <div className="mt-8 border-t border-gray-100 pt-6 flex justify-end">
          <div className="w-80 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Tạm tính ({items.length} dòng)</span>
              <span>{fmt(subtotal)}</span>
            </div>
            {contingencyPct > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Dự phòng {contingencyPct}%</span>
                <span>{fmt(contingencyAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>VAT {vatPct}%</span>
              <span>{fmt(vatAmount)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-200 pt-3 mt-2">
              <span>Tổng cộng</span>
              <span>{fmt(total)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
