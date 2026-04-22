'use client'

import { Search, Bell, Plus } from 'lucide-react'

export function Topbar() {
  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-2 flex-1 max-w-md">
        <Search className="w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Search projects, tasks, contacts…" className="flex-1 text-sm bg-transparent focus:outline-none placeholder:text-gray-400" />
      </div>
      <div className="flex items-center gap-3">
        <button className="p-2 hover:bg-gray-50 rounded-sm"><Bell className="w-4 h-4 text-gray-600" /></button>
        <button className="flex items-center gap-1.5 bg-gray-900 text-white px-3 py-1.5 rounded-sm text-sm font-medium hover:bg-gray-800"><Plus className="w-3.5 h-3.5" /> New</button>
      </div>
    </header>
  )
}
