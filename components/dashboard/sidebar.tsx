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
  { href: '/time-