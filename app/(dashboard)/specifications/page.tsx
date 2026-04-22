import { redirect } from 'next/navigation'
import { getCurrentContext } from '@/lib/supabase/current-studio'

export const dynamic = 'force-dynamic'

export default async function SpecificationsPage() {
  const { supabase, user, studioId } = await getCurrentContext()
  if (!user) redirect('/login')
  if (!studioId) redirect('/onboarding')

  const { data: projects } = await supabase.from('projects').select('id, name, code').eq('studio_id', studioId)
  const projectMap = new Map((projects ?? []).map((p) => [p.id, p]))
  const projectIds = (projects ?? []).map((p) => p.id)

  const { data: specs } = await supabase
    .from('specifications')
    .select('*')
    .in('project_id', projectIds.length ? projectIds : ['00000000-0000-0000-0000-000000000000'])

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">Specifications</h1>
      <p className="text-sm text-gray-500 mb-8">Furniture, fixtures & equipment across all projects.</p>
      <div className="bg-white border border-gray-100 rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-[11px] uppercase text-gray-500 tracking-wider">
            <tr>
              <th className="text-left px-4 py-2.5">Project</th>
              <th className="text-left px-4 py-2.5">Room</th>
              <th className="text-left px-4 py-2.5">Item</th>
              <th className="text-right px-4 py-2.5">Qty</th>
              <th className="text-right px-4 py-2.5">Unit Price</th>
              <th className="text-left px-4 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {specs?.map((s: Record<string, unknown>) => {
              const p = projectMap.get(s.project_id as string)
              return (
                <tr key={s.id as string} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600 text-xs">{p?.code ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{(s.room as string) ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-900">{s.name as string}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{(s.quantity as string) ?? '—'}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{s.unit_price ? Number(s.unit_price).toLocaleString() : '—'}</td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{s.status as string}</td>
                </tr>
              )
            })}
            {(!specs || specs.length === 0) && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                  No specifications yet. Add items from project detail.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
