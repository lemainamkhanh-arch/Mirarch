'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Briefcase,
  Calendar,
  FileText,
  Sparkles,
  Clock,
  CheckSquare,
  BookUser,
  Image as ImageIcon,
  Package,
} from 'lucide-react'

const TOOLS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/projects', label: 'Projects', icon: Briefcase },
  { href: '/schedule', label: 'Schedule', icon: Calendar },
  { href: '/specifications', label: 'Specifications', icon: FileText },
  { href: '/ai-studio', label: 'AI Studio', icon: Sparkles },
  { href: '/time-tracking', label: 'Time Tracking', icon: Clock },
  { href: '/todo', label: 'To-Do List', icon: CheckSquare },
]

const LIBRARIES = [
  { href: '/address-book', label: 'Address Book', icon: BookUser },
  { href: '/image-library', label: 'Image Library', icon: ImageIcon },
  { href: '/product-library', label: 'Product Library', icon: Package },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0">
      <div className="p-4 flex items-center gap-2 border-b border-gray-100">
        <div className="w-7 h-7 bg-gray-900 rounded-md flex items-center justify-center text-white text-xs font-bold">L</div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900 leading-tight">Lily Studio</span>
          <span className="text-[11px] text-gray-500 leading-tight">Le Mai Khanh</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">Tools</p>
          <ul className="space-y-0.5">
            {TOOLS.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/')
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link href={item.href} className={`flex items-center gap-2.5 px-2 py-1.5 rounded-sm text-sm ${active ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

        <div>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">Libraries</p>
          <ul className="space-y-0.5">
            {LIBRARIES.map((item) => {
              const active = pathname === item.href
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link href={item.href} className={`flex items-center gap-2.5 px-2 py-1.5 rounded-sm text-sm ${active ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </nav>

      <div className="m-3 p-3 bg-gray-900 rounded-sm text-white">
        <p className="text-xs font-semibold">Upgrade your plan</p>
        <p className="text-[11px] text-gray-400 mt-0.5">6 days left</p>
      </div>
    </aside>
  )
}
