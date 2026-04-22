'use client'

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

const COLORS = ['#111827', '#6B7280', '#9CA3AF', '#D1D5DB', '#E5E7EB']

export function PortfolioHealth({ data, total }: { data: { name: string; value: number }[]; total: number }) {
  const hasData = data.some((d) => d.value > 0)
  return (
    <div className="bg-white border border-gray-100 rounded-sm p-6">
      <h2 className="text-sm font-semibold text-gray-900 mb-4">Portfolio Health</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="relative h-64">
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
                  {data.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-gray-400">No data yet</div>
          )}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-bold text-gray-900">{total}</span>
            <span className="text-xs text-gray-500">Active</span>
          </div>
        </div>
        <ul className="space-y-3">
          {data.map((d, i) => {
            const dotStyle = { backgroundColor: COLORS[i % COLORS.length] }
            return (
              <li key={d.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={dotStyle} />
                  <span className="text-gray-700">{d.name}</span>
                </div>
                <span className="text-gray-900 font-medium">{d.value}</span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
