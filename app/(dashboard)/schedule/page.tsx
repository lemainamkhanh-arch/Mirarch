import { redirect } from 'next/navigation'
import { getCurrentContext } from '@/lib/supabase/current-studio'

export const dynamic = 'force-dynamic'

export default async function SchedulePage() {
  const { supabase, user, studioId } = await getCurrentContext()
  if (!user) redirect('/login')
  if (!studioId) redirect('/onboarding')

  const { data: projects } = await supabase
    .from('projects')
    .select('id, code, name, start_date, end_date, status')
    .eq('studio_id', studioId)
    .order('start_date', { ascending: true, nullsFirst: false })

  const minDate = new Date()
  minDate.setMonth(minDate.getMonth() - 2)
  minDate.setDate(1)
  const monthsCount = 12
  const totalDays = monthsCount * 30

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">Schedule</h1>
      <p className="text-sm text-gray-500 mb-8">Timeline view of every project.</p>
      <div className="bg-white border border-gray-100 rounded-sm p-6 overflow-x-auto">
        <div className="min-w-[900px]">
          <div className="flex text-[11px] text-gray-400 uppercase tracking-wider mb-2 ml-56">
            {Array.from({ length: monthsCount }).map((_, i) => {
              const d = new Date(minDate)
              d.setMonth(d.getMonth() + i)
              return (
                <div key={i} className="flex-1">
                  {d.toLocaleString('en-US', { month: 'short', year: '2-digit' })}
                </div>
              )
            })}
          </div>
          <div className="space-y-2">
            {projects?.map((p) => {
              const start = p.start_date ? new Date(p.start_date).getTime() : null
              const end = p.end_date ? new Date(p.end_date).getTime() : null
              const hasBoth = start && end
              let offsetPct = 0
              let widthPct = 0
              if (hasBoth) {
                offsetPct = Math.max(0, ((start - minDate.getTime()) / (1000 * 60 * 60 * 24)) / totalDays * 100)
                widthPct = Math.max(1, ((end - start) / (1000 * 60 * 60 * 24)) / totalDays * 100)
              }
              return (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="w-56 shrink-0 truncate text-xs text-gray-600">{p.code} — {p.name}</div>
                  <div className="flex-1 relative h-6 bg-gray-50 rounded">
                    {hasBoth ? (
                      <div
                        className="absolute top-0 bottom-0 bg-gray-900 rounded text-[10px] text-white flex items-center px-1.5 whitespace-nowrap overflow-hidden"
                        style={{ left: `${offsetPct}%`, width: `${widthPct}%` }}
                      >
                        {p.status}
                      </div>
                    ) : (
                      <span className="text-[11px] text-gray-400 px-2">No dates</span>
                    )}
                  </div>
                </div>
              )
            })}
            {(!projects || projects.length === 0) && (
              <p className="text-sm text-gray-400 text-center py-10">No projects yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
