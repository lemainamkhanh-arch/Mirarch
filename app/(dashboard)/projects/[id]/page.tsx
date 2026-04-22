import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getCurrentContext } from '@/lib/supabase/current-studio'

export const dynamic = 'force-dynamic'

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { supabase, user, studioId } = await getCurrentContext()
  if (!user) redirect('/login')
  if (!studioId) redirect('/onboarding')

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .eq('studio_id', studioId)
    .maybeSingle()
  if (!project) notFound()

  const [{ data: tasks }, { data: specs }] = await Promise.all([
    supabase
      .from('tasks')
      .select('id, title, status, priority, due_date')
      .eq('project_id', id)
      .order('due_date', { ascending: true, nullsFirst: false }),
    supabase.from('specifications').select('id, room, name, quantity, unit_price, status').eq('project_id', id),
  ])

  return (
    <div className="p-8">
      <Link href="/projects" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Projects
      </Link>
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{project.code}</p>
          <h1 className="text-3xl font-bold text-gray-900 mt-1">{project.name}</h1>
          <p className="text-sm text-gray-500 mt-1">{[project.style, project.status, `Priority ${project.priority}`].filter(Boolean).join(' · ')}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Budget</p>
          <p className="text-lg font-semibold text-gray-900">
            {project.budget ? `${project.currency ?? 'USD'} ${Number(project.budget).toLocaleString()}` : '—'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white border border-gray-100 rounded-sm p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Tasks ({tasks?.length ?? 0})</h2>
          {tasks && tasks.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {tasks.map((t) => (
                <li key={t.id} className="py-2 text-sm">
                  <p className="text-gray-900">{t.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t.status} · {t.priority} · {t.due_date ?? 'no deadline'}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">No tasks yet.</p>
          )}
        </section>

        <section className="bg-white border border-gray-100 rounded-sm p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Furniture Schedule ({specs?.length ?? 0})</h2>
          {specs && specs.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {specs.map((s) => (
                <li key={s.id} className="py-2 text-sm">
                  <p className="text-gray-900">{s.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.room ?? '—'} · Qty {s.quantity ?? '—'} · {s.status}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">No specifications yet.</p>
          )}
        </section>
      </div>

      <p className="text-xs text-gray-400 mt-8">Tabs (Overview · Presentation · PM · Furniture · Document) coming in Phase 2.</p>
    </div>
  )
}
