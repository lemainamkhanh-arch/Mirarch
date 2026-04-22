import Link from 'next/link'
import { Plus } from 'lucide-react'
import { MOCK_PROJECTS } from '@/lib/mirarch/mock-data'

export default function ProjectsPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Projects</h1>
          <p className="text-sm text-gray-500">Manage every project in your studio.</p>
        </div>
        <button className="flex items-center gap-1.5 bg-gray-900 text-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-gray-800"><Plus className="w-4 h-4" /> New Project</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {MOCK_PROJECTS.map((p) => (
          <Link key={p.id} href={`/projects/${p.id}`} className="bg-white border border-gray-100 rounded-sm p-5 hover:shadow-lg transition-shadow block">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{p.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{p.client}</p>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{p.status}</span>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-500">{new Date(p.startDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</span>
              <span className="text-xs font-medium text-gray-900">${(p.budget / 1_000_000).toFixed(1)}M</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
