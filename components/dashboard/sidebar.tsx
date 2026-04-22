'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
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
  Languages,
} from 'lucide-react'

type Lang = 'vi' | 'en'

const NAV_TOOLS = [
  { href: '/dashboard', icon: LayoutDashboard, vi: 'Tổng quan', en: 'Dashboard' },
  { href: '/projects', icon: Briefcase, vi: 'Dự án', en: 'Projects' },
  { href: '/schedule', icon: Calendar, vi: 'Lịch trình', en: 'Schedule' },
  { href: '/specifications', icon: FileText, vi: 'Bảng vật liệu', en: 'Specifications' },
  { href: '/ai-studio', icon: Sparkles, vi: 'AI Studio', en: 'AI Studio' },
  { href: '/time-tracking', icon: Clock, vi: 'Theo dõi giờ', en: 'Time Tracking' },
  { href: '/todo', icon: CheckSquare, vi: 'Việc cần làm', en: 'To-Do' },
]

const NAV_LIBS = [
  { href: '/address-book', icon: BookUser, vi: 'Sổ địa chỉ', en: 'Address Book' },
  { href: '/image-library', icon: ImageIcon, vi: 'Thư viện ảnh', en: 'Image Library' },
  { href: '/product-library', icon: Package, vi: 'Thư viện FF&E', en: 'Product Library' },
]

export function Sidebar({
  studioName,
  ownerName,
}: {
  studioName: string
  ownerName: string
}) {
  const pathname = usePathname()
  const [lang, setLang] = useState<Lang>('vi')

  useEffect(() => {
    const saved = localStorage.getItem('mirarch_lang') as Lang | null
    if (saved === 'vi' || saved === 'en') setLang(saved)
  }, [])

  function toggleLang() {
    const next: Lang = lang === 'vi' ? 'en' : 'vi'
    setLang(next)
    localStorage.setItem('mirarch_lang', next)
  }

  // initials from studio name
  const initials = studioName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <aside className="w-60 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0">
      {/* Studio header */}
      <div className="p-4 flex items-center gap-2 border-b border-gray-100">
        <div className="w-7 h-7 bg-gray-900 rounded-md flex items-center justify-center text-white text-[11px] font-bold shrink-0">
          {initials}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold text-gray-900 leading-tight truncate">
            {studioName}
          </span>
          <span className="text-[11px] text-gray-500 leading-tight truncate">{ownerName}</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">
            {lang === 'vi' ? 'Công cụ' : 'Tools'}
          </p>
          <ul className="space-y-0.5">
            {NAV_TOOLS.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(item.href + '/')
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-2.5 px-2 py-1.5 rounded-sm text-sm ${
                      active
                        ? 'bg-gray-100 text-gray-900 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{lang === 'vi' ? item.vi : item.en}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

        <div>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">
            {lang === 'vi' ? 'Thư viện' : 'Libraries'}
          </p>
          <ul className="space-y-0.5">
            {NAV_LIBS.map((item) => {
              const active = pathname === item.href
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-2.5 px-2 py-1.5 rounded-sm text-sm ${
                      active
                        ? 'bg-gray-100 text-gray-900 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{lang === 'vi' ? item.vi : item.en}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </nav>

      <div className="px-3 pb-3 space-y-2">
        {/* Lang toggle */}
        <button
          onClick={toggleLang}
          className="w-full flex items-center justify-between px-3 py-2 rounded-sm border border-gray-100 text-xs text-gray-500 hover:bg-gray-50"
        >
          <span className="flex items-center gap-1.5">
            <Languages className="w-3.5 h-3.5" />
            {lang === 'vi' ? 'Ngôn ngữ' : 'Language'}
          </span>
          <span className="font-semibold text-gray-900">{lang.toUpperCase()}</span>
        </button>

        {/* Upgrade banner */}
        <div className="p-3 bg-gray-900 rounded-sm text-white">
          <p className="text-xs font-semibold">
            {lang === 'vi' ? 'Nâng cấp gói' : 'Upgrade plan'}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {lang === 'vi' ? 'Còn 6 ngày' : '6 days left'}
          </p>
        </div>
      </div>
    </aside>
  )
}
