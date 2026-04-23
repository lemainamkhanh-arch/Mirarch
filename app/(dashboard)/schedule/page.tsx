import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentContext } from '@/lib/supabase/current-studio'

export const dynamic = 'force-dynamic'

const STATUS_COLOR: Record<string, string> = {
  proposal: 'bg-gray-400',
  in_progress: 'bg-blue-600',
  feedback: 'bg-amber-500',
  on_hold: 'bg-orange-400',
  done: 'bg-green-500',
  archived: 'bg-gray-300',
}

const STATUS_LABEL: Record<string, string> = {
  proposal: 'Proposal',
  in_progress: 'In Progress',
  feedback: 'Feedback',
  on_hold: 'On Hold',
  done: 'Done',
  archived: 'Archived',
}

export default async function SchedulePage() {
  const { supabase, user, studioId } = await getCurrentContext()
  if (!user) redirect('/login')
  if (!studioId) redirect('/onboarding')

  const { data: projects } = await supabase
    .from('projects')
    .select('id, code, name, start_date, end_date, status')
    .eq('studio_id', studioId)
    .order('start_date', { ascending: true, nullsFirst: false })

  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, project_id, title, due_date, status')
    .in('project_id', (projects ?? []).map((p) => p.id))
    .not('due_date', 'is', null)
    .in('status', ['not_started', 'in_progress', 'blocked'])

  // Timeline: 3 months ago → 15 months ahead (18 months total)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const minDate = new Date(today)
  minDate.setMonth(minDate.getMonth() - 3)
  minDate.setDate(1)
  const monthsCount = 18
  const totalMs = monthsCount * 30 * 24 * 60 * 60 * 1000

  function pct(dateStr: string) {
    const ms = new Date(dateStr).getTime() - minDate.getTime()
    return Math.min(100, Math.max(0, (ms / totalMs) * 100))
  }

  const todayPct = pct(today.toISOString().slice(0, 10))

  // Tasks keyed by project
  const tasksByProject = new Map<string, typeof tasks>()
  for (const t of tasks ?? []) {
    if (!tasksByProject.has(t.project_id as string))
      tasksByProject.set(t.project_id as string, [])
    tasksByProject.get(t.project_id as string)!.push(t)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Schedule</h1>
          <p className="text-sm text-gray-500">Timeline view of every project.</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          {Object.entries(STATUS_LABEL).map(([k, v]) => (
            <span key={k} className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full inline-block ${STATUS_COLOR[k]}`} />
              {v}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-sm p-6 overflow-x-auto">
        <div style= minWidth: '900px' >
          {/* Month headers */}
          <div className="flex text-[11px] text-gray-400 uppercase tracking-wider mb-1 ml-56 relative">
            {Array.from({ length: monthsCount }).map((_, i) => {
              const d = new Date(minDate)
              d.setMonth(d.getMonth() + i)
              const isCurrentMonth =
                d.getFullYear() === today.getFullYear() &&
                d.getMonth() === today.getMonth()
              return (
                <div
                  key={i}
                  className={`flex-1 ${
                    isCurrentMonth ? 'font-bold text-gray-900' : ''
                  }`}
                >
                  {d.toLocaleString('vi-VN', { month: 'short', year: '2-digit' })}
                </div>
              )
            })}
          </div>

          {/* Rows */}
          <div className="space-y-1.5 relative">
            {/* Today vertical line */}
            <div
              className="absolute top-0 bottom-0 w-px bg-red-400 z-10 pointer-events-none"
              style={{ left: `calc(14rem + ${todayPct}% * (100% - 14rem) / 100)` }}
            />

            {projects?.map((p) => {
              const hasStart = !!p.start_date
              const hasEnd = !!p.end_date
              const hasBoth = hasStart && hasEnd
              const startPct = hasStart ? pct(p.start_date!) : 0
              const endPct = hasEnd ? pct(p.end_date!) : 0
              const widthPct = Math.max(0.5, endPct - startPct)
              const projectTasks = tasksByProject.get(p.id) ?? []

              return (
                <div key={p.id}>
                  <div className="flex items-center gap-3">
                    <div className="w-56 shrink-0 min-w-0">
                      <Link
                        href={`/projects/${p.id}`}
                        className="text-xs text-gray-700 hover:text-gray-900 hover:underline truncate block"
                        title={p.name}
                      >
                        <span className="font-mono text-gray-400 mr-1">{p.code}</span>
                        {p.name}
                      </Link>
                    </div>
                    <div className="flex-1 relative h-7 bg-gray-50 rounded-sm overflow-hidden">
                      {hasBoth ? (
                        <Link
                          href={`/projects/${p.id}`}
                          className={`absolute inset-y-0 rounded-sm flex items-center px-2 text-[10px] text-white font-medium whitespace-nowrap overflow-hidden hover:brightness-90 ${
                            STATUS_COLOR[p.status] ?? 'bg-gray-700'
                          }`}
                          style={{ left: `${startPct}%`, width: `${widthPct}%` }}
                          title={`${p.start_date} → ${p.end_date}`}
                        >
                          {widthPct > 6 ? STATUS_LABEL[p.status] ?? p.status : ''}
                        </Link>
                      ) : (
                        <span className="text-[11px] text-gray-300 px-2 leading-7">
                          No dates
                        </span>
                      )}
                      {/* Task milestone dots */}
                      {projectTasks.map((t) => {
                        if (!t.due_date) return null
                        const tp = pct(t.due_date as string)
                        const isPast =
                          new Date(t.due_date as string) < today
                        return (
                          <span
                            key={t.id}
                            title={`${t.title} — ${t.due_date}`}
                            className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border-2 border-white z-10 ${
                              isPast ? 'bg-red-500' : 'bg-yellow-400'
                            }`}
                            style={{ left: `calc(${tp}% - 4px)` }}
                          />
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}

            {(!projects || projects.length === 0) && (
              <p className="text-sm text-gray-400 text-center py-10">
                No projects yet.{' '}
                <Link href="/projects/new" className="underline">
                  Create one.
                </Link>
              </p>
            )}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 text-[11px] text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-400 border-2 border-white inline-block" />
              Task milestone (upcoming)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500 border-2 border-white inline-block" />
              Task milestone (overdue)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-px h-3 bg-red-400 inline-block" />
              Today
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
