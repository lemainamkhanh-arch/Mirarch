import { redirect } from 'next/navigation'
import { getCurrentContext } from '@/lib/supabase/current-studio'

export const dynamic = 'force-dynamic'

export default async function TimeTrackingPage() {
  const { supabase, user, studioId } = await getCurrentContext()
  if (!user) redirect('/login')
  if (!studioId) redirect('/onboarding')

  const { data: projects } = await supabase.from('projects').select('id, name, code').eq('studio_id', studioId)
  const projectMap = new Map((projects ?? []).map((p) => [p.id, p]))
  const projectIds = (projects ?? []).map((p) => p.id)

  const { data: entries } = await supabase
    .from('time_entries')
    .select('id, project_id, start_at, minutes, note')
    .in('project_id', projectIds.length ? projectIds : ['00000000-0000-0000-0000-000000000000'])
    .order('start_at', { ascending: false })

  const totalMinutes = (entries ?? []).reduce((sum, e) => sum + Number(e.minutes ?? 0), 0)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Time Tracking</h1>
          <p className="text-sm text-gray-500">Log billable hours per project.</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Total logged</p>
          <p className="text-lg font-semibold text-gray-900">{(totalMinutes / 60).toFixed(1)} h</p>
        </div>
      </div>
      <div className="bg-white border border-gray-100 rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-[11px] uppercase text-gray-500 tracking-wider">
            <tr>
              <th className="text-left px-4 py-2.5">Start</th>
              <th className="text-left px-4 py-2.5">Project</th>
              <th className="text-left px-4 py-2.5">Note</th>
              <th className="text-right px-4 py-2.5">Hours</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {entries?.map((e) => {
              const p = projectMap.get(e.project_id as string)
              return (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600 text-xs">{e.start_at ? new Date(e.start_at as string).toLocaleString() : '—'}</td>
                  <td className="px-4 py-3 text-gray-900">{p ? `${p.code} — ${p.name}` : '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{(e.note as string) ?? '—'}</td>
                  <td className="px-4 py-3 text-right text-gray-900 font-medium">{(Number(e.minutes ?? 0) / 60).toFixed(1)}</td>
                </tr>
              )
            })}
            {(!entries || entries.length === 0) && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-gray-400">No time entries yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
