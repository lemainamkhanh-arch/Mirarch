import { Sidebar } from '@/components/dashboard/sidebar'
import { Topbar } from '@/components/dashboard/topbar'
import { getCurrentContext } from '@/lib/supabase/current-studio'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { studioName, ownerName } = await getCurrentContext()
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        studioName={studioName ?? 'Studio'}
        ownerName={ownerName ?? 'Owner'}
      />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
