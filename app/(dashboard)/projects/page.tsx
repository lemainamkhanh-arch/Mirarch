import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus } from 'lucide-react'
import { getCurrentContext } from '@/lib/supabase/current-studio'

export const dynamic = 'force-dynamic'

const STATUS_LABEL: Record<string, string> = {
  proposal: 'Proposal',
  in_progress: 'In Progress',
  feedback: 'Feedback',
  on_hold: 'On Hold',
  done: 'Done',
  archived: 'Archived',
}

export default async function ProjectsPage() {
  const { supabase, user, studioId } = await getCurrentContext()
  if (!user) redirect('/login')
  if (!studioId) redirect('/onboarding')

  const { data: projects } = await supabase
    .from('projects')
    .select('id, code, name, status, priority, budget, currency, start_date, style')
    .eq('studio_id', studioId)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Projects</h1>
          <p className="text-sm text-gray-500">Manage every project in your studio.</p>
        </div>
        <Link href="/projects/new" className="flex items-center gap-1.5 bg-gray-900 text-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-gray-800">
          <Plus className="w-4 h-4" /> New Project
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {projects?.map((p) => (
          <Link key={p.id} href={`/projects/${p.id}`} className="bg-white border border-gray-100 rounded-sm p-5 hover:shadow-lg transition-shadow block">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{p.code}</p>
                <h3 className="text-sm font-semibold text-gray-900 mt-0.5">{p.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{p.style ?? '—'}</p>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{STATUS_LABEL[p.status as string] ?? p.status}</span>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-500">{p.start_date ?? '—'}</span>
              <span className="text-xs font-medium text-gray-900">
                {p.budget ? `${p.currency ?? 'USD'} ${Number(p.budget).toLocaleString()}` : '—'}
              </span>
            </div>
          </Link>
        ))}
        <Link href="/projects/new" className="border-2 border-dashed border-gray-200 rounded-sm p-5 text-center text-sm text-gray-500 hover:border-gray-900 hover:text-gray-900 flex items-center justify-center min-h-[140px]">
          + Create New Project
        </Link>
      </div>
    </div>
  )
}
