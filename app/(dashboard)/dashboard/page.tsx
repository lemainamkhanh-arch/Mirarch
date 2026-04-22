'use client'

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { Briefcase, Clock, DollarSign, AlertTriangle } from 'lucide-react'
import { METRICS, PIE_DATA, PIE_COLORS } from '@/lib/mirarch/mock-data'

const DOT_STYLES: React.CSSProperties[] = PIE_COLORS.map((c) => ({ backgroundColor: c }))

export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">Welcome back, Le Mai Khanh</h1>
      <p className="text-sm text-gray-500 mb-8">Here’s what’s happening across your studio today.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Active Projects" value={METRICS.activeProjects.toString()} icon={Briefcase} />
        <KpiCard label="Pending Approvals" value={METRICS.pendingApprovals.toString()} icon={Clock} />
        <KpiCard label="Total Budget" value={`$${(METRICS.totalBudget / 1_000_000).toFixed(1)}M`} icon={DollarSign} />
        <KpiCard label="Critical Risks" value={METRICS.criticalRisks.toString()} icon={AlertTriangle} />
      </div>

      <div className="bg-white border border-gray-100 rounded-sm p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Portfolio Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="relative h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
                  {PIE_DATA.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-gray-900">12</span>
              <span className="text-xs text-gray-500">Active</span>
            </div>
          </div>
          <ul className="space-y-3">
            {PIE_DATA.map((d, i) => (
              <li key={d.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={DOT_STYLES[i]} />
                  <span className="text-gray-700">{d.name}</span>
                </div>
                <span className="text-gray-900 font-medium">{d.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function KpiCard({ label, value, icon: Icon }: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="bg-white border border-gray-100 rounded-sm p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</span>
        <Icon className="w-4 h-4 text-gray-400" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}
