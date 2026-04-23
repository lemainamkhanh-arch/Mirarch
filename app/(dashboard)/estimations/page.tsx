import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentContext } from '@/lib/supabase/current-studio'
import { createEstimateAction, deleteEstimateAction } from './actions'

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

type ProjectLite = { code: string; name: string }

type EstimateRow = {
  id: string
  title: string
  status: string
  currency: string
  version: number
  created_at: string
  project_id: string | null
  projects: ProjectLite | null
}

type ProjectRow = { id: string; code: string; name: string }

export default async function EstimationsPage({
  searchParams,
}: {
  searchParams: Promise<{ add?: string }>
}) {
  const sp = await searchParams
  const showAdd = sp.add === '1'
  const { supabase, user, studioId } = await getCurrentContext()
  if (!user) redirect('/login')
  if (!studioId) redirect('/onboarding')

  const [estimatesRes, projectsRes] = await Promise.all([
    supabase
      .from('estimates')
      .select('id, title, status, currency, version, created_at, project_id, projects(code, name)')
      .eq('studio_id', studioId)
      .order('created_at', { ascending: false }),
    supabase
      .from('projects')
      .select('id, code, name')
      .eq('studio_id', studioId)
      .in('status', ['proposal', 'in_progress', 'feedback', 'on_hold'])
      .order('name'),
  ])

  const rawEstimates = (estimatesRes.data ?? []) as any[]
  const estimates: EstimateRow[] = rawEstimates.map((r) => ({
    id: r.id,
    title: r.title,
    status: r.status,
    currency: r.currency,
    version: r.version,
    created_at: r.created_at,
    project_id: r.project_id ?? null,
    projects: Array.isArray(r.projects)
      ? ((r.projects[0] as ProjectLite | undefined) ?? null)
      : ((r.projects as ProjectLite | null) ?? null),
  }))
  const projects = ((projectsRes.data ?? []) as any[]) as ProjectRow[]

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Dự toán</h1>
          <p className="text-sm text-gray-500">
            Báo giá chi tiết theo hạng mục · gửi khách duyệt · theo dõi phê duyệt.
          </p>
        </div>
        <Link
          href="?add=1"
          className="bg-gray-900 text-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-gray-800"
        >
          + Tạo dự toán
        </Link>
      </div>

      {showAdd && (
        <form
          action={createEstimateAction}
          className="bg-white border border-gray-200 rounded-sm p-5 mb-6 space-y-4"
        >
          <h2 className="text-sm font-semibold text-gray-900">Dự toán mới</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Tên dự toán</label>
              <input
                name="title"
                defaultValue="Dự toán"
                autoFocus
                className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Tiền tệ</label>
              <select
                name="currency"
                defaultValue="VND"
                className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm"
              >
                <option value="VND">VND</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Gắn với dự án</label>
            <select
              name="project_id"
              className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm"
            >
              <option value="">— Không gắn dự án —</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} · {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-gray-900 text-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-gray-800"
            >
              Tạo
            </button>
            <Link
              href="/estimations"
              className="px-4 py-2 rounded-sm text-sm text-gray-600 hover:bg-gray-100 border border-gray-200"
            >
              Huỷ
            </Link>
          </div>
        </form>
      )}

      <div className="bg-white border border-gray-100 rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
              <th className="text-left px-4 py-3 font-medium">Tên dự toán</th>
              <th className="text-left px-4 py-3 font-medium">Dự án</th>
              <th className="text-left px-4 py-3 font-medium">Tiền tệ</th>
              <th className="text-left px-4 py-3 font-medium">Trạng thái</th>
              <th className="text-left px-4 py-3 font-medium">Ngày tạo</th>
              <th className="px-4 py-3 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {estimates.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-sm">
                  Chưa có dự toán nào.{' '}
                  <Link href="?add=1" className="underline">
                    Tạo mới.
                  </Link>
                </td>
              </tr>
            )}
            {estimates.map((e) => (
              <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/estimations/${e.id}`}
                    className="font-medium text-gray-900 hover:underline"
                  >
                    {e.title}
                  </Link>
                  <span className="ml-2 text-xs text-gray-400">v{e.version}</span>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {e.projects ? (
                    <Link
                      href={`/projects/${e.project_id}`}
                      className="hover:underline"
                    >
                      <span className="font-mono text-xs text-gray-400 mr-1">
                        {e.projects.code}
                      </span>
                      {e.projects.name}
                    </Link>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-600">{e.currency}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      'text-xs px-2 py-0.5 rounded-full ' +
                      (STATUS_COLOR[e.status] ?? 'bg-gray-100 text-gray-700')
                    }
                  >
                    {STATUS_LABEL[e.status] ?? e.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {new Date(e.created_at).toLocaleDateString('vi-VN')}
                </td>
                <td className="px-4 py-3 text-right">
                  <form action={deleteEstimateAction.bind(null, e.id)}>
                    <button
                      type="submit"
                      className="text-xs text-gray-400 hover:text-red-500"
                    >
                      Xoá
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
