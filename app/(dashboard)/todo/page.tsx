import { redirect } from 'next/navigation'
import { getCurrentContext } from '@/lib/supabase/current-studio'

export const dynamic = 'force-dynamic'

const STATUS_COLOR: Record<string, string> = {
  not_started: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-blue-100 text-blue-700',
  blocked: 'bg-red-100 text-red-700',
  done: 'bg-green-100 text-green-700',
  archived: 'bg-gray-100 text-gray-400',
}

export default async function TodoPage() {
  const { supabase, user, studioId } = await getCurrentContext()
  if (!user) redirect('/login')
  if (!studioId) redirect('/onboarding')

  const { data: projects } = await supabase.from('projects').select('id, name, code').eq('studio_id', studioId)
  const projectMap = new Map((projects ?? []).map((p) => [p.id, p]))
  const projectIds = (projects ?? []).map((p) => p.id)

  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, title, status, priority, due_date, project_id')
    .in('project_id', projectIds.length ? projectIds : ['00000000-0000-0000-0000-000000000000'])
    .order('due_date', { ascending: true, nullsFirst: false })

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">To-Do</h1>
      <p className="text-sm text-gray-500 mb-8">All tasks across your studio.</p>
      <div className="bg-white border border-gray-100 rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-[11px] uppercase text-gray-500 tracking-wider">
            <tr>
              <th className="text-left px-4 py-2.5">Task</th>
              <th className="text-left px-4 py-2.5">Project</th>
              <th className="text-left px-4 py-2.5">Status</th>
              <th className="text-left px-4 py-2.5">Priority</th>
              <th className="text-left px-4 py-2.5">Due</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tasks?.map((t) => {
              const p = projectMap.get(t.project_id as string)
              return (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">{t.title}</td>
                  <td className="px-4 py-3 text-gray-600">{p ? `${p.code} — ${p.name}` : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium ${STATUS_COLOR[t.status as string] ?? 'bg-gray-100 text-gray-700'}`}>{t.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{t.priority}</td>
                  <td className="px-4 py-3 text-gray-600">{t.due_date ?? '—'}</td>
                </tr>
              )
            })}
            {(!tasks || tasks.length === 0) && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-400">No tasks yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
