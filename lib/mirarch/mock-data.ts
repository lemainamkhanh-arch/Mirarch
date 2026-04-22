import type { Project } from './types'

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Khanh Le',
    client: 'Private Residence',
    status: 'Design',
    budget: 3200000,
    startDate: '2026-01-22',
    endDate: '2026-11-30',
  },
  {
    id: 'p2',
    name: 'Demo Project',
    client: 'Demo Client',
    status: 'Planning',
    budget: 1500000,
    startDate: '2023-12-08',
    endDate: '2024-06-30',
  },
  {
    id: 'p3',
    name: 'Interior Decor & Styling',
    client: 'Atelier Co.',
    status: 'Construction',
    budget: 4800000,
    startDate: '2023-12-08',
    endDate: '2024-09-15',
  },
  {
    id: 'p4',
    name: 'Interior Design & Arch.',
    client: 'Lily Studio',
    status: 'Completed',
    budget: 4700000,
    startDate: '2023-12-08',
    endDate: '2024-04-20',
  },
]

export const METRICS = {
  activeProjects: 12,
  pendingApprovals: 4,
  totalBudget: 14200000,
  criticalRisks: 2,
}

export const PIE_DATA = [
  { name: 'On Track', value: 8 },
  { name: 'At Risk', value: 2 },
  { name: 'Delayed', value: 2 },
]

export const PIE_COLORS = ['#111827', '#9CA3AF', '#E5E7EB']
