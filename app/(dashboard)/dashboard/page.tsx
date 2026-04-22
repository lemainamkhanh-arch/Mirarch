import { redirect } from 'next/navigation'
import { Briefcase, Clock, DollarSign, AlertTriangle } from 'lucide-react'
import { getCurrentContext } from '@/lib/supabase/current-studio'
import { PortfolioHealth } from '@/components/dashboard/portfolio-health'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const { supabase, user, studioId } = await getCurrentContext()
  if (!user) redirect('/login')
  if (!studioId) redirect('/onboarding')

  const { data: projects } = await supabase
    .from('projects')
    .select('id, status, budget')
    .eq('studio_id', studioId)

  const rows = projects ?? []
  const countBy = (s: string) => rows.filter((p) => p.status === s).length
  const active = rows.filter((p) => ['proposal', 'in_progress', 'feedback'].includes(p.status as string)).length
  const totalBudget = rows.reduce((s, p) => s + Number(p.budget ?? 0), 0)

  const projectIds = rows.map((p) => p.id)
  const { count: openTasks } = await supabase
    .from('tasks')
    .select('id', { count: 'exact', head: true })
    .in('project_id', projectIds.length ? projectIds : ['00000000-0000-0000-0000-000000000000'])
    .in('status', ['not_started', 'in_progress', 'blocked'])

  const pie = [
    { name: 'Proposal', value: countBy('proposal') },
    { name: 'In progress', value: countBy('in_progress') },
    { name: 'Feedback', value: countBy('feedback') },
    { name: 'On hold', value: countBy('on_hold') },
    { name: 'Done', value: countBy('done') },
  ]

  const metadata = (user.user_metadata ?? {}) as { full_name?: string }
  const fullName = metadata.full_name ?? user.email ?? 'Architect'

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">Welcome back, {fullName}</h1>
      <p className="text-sm text-gray-500 mb-8">Here’s what’s happening across your studio today.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Kpi label="Active Projects" value={active.toString()} icon={Briefcase} />
        <Kpi label="Open Tasks" value={(openTasks ?? 0).toString()} icon={Clock} />
        <Kpi label="Total Budget" value={`$${(totalBudget / 1_000_000).toFixed(1)}M`} icon={DollarSign} />
        <Kpi label="Needs Feedback" value={countBy('feedback').toString()} icon={AlertTriangle} />
      </div>

      <PortfolioHealth data={pie} total={active} />
    </div>
  )
}

function Kpi({ label, value, icon: Icon }: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="bg-white border border-gray-100 rounded-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</span>
        <Icon className="w-4 h-4 text-gray-400" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}
