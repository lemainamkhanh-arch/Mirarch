import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createStudioAction } from './actions'

export const dynamic = 'force-dynamic'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: memb } = await supabase
    .from('memberships')
    .select('studio_id')
    .eq('user_id', user.id)
    .maybeSingle()
  if (memb?.studio_id) redirect('/dashboard')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <div className="max-w-md w-full bg-white border border-gray-100 rounded-sm p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create your studio</h1>
        <p className="text-sm text-gray-500 mb-6">Tell us about your studio so we can set up your workspace.</p>
        <form action={createStudioAction} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Studio name</label>
            <input name="name" required className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-gray-900" placeholder="Lily Studio" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Slug</label>
            <input name="slug" required pattern="[a-z0-9-]+" className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-gray-900" placeholder="lily-studio" />
            <p className="text-[11px] text-gray-400 mt-1">Lowercase letters, numbers, hyphens.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Timezone</label>
              <select name="timezone" defaultValue="Asia/Ho_Chi_Minh" className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm">
                <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh</option>
                <option value="UTC">UTC</option>
                <option value="Asia/Tokyo">Asia/Tokyo</option>
                <option value="Asia/Singapore">Asia/Singapore</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Language</label>
              <select name="locale" defaultValue="vi" className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm">
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
          <button type="submit" className="w-full bg-gray-900 text-white py-2.5 rounded-sm text-sm font-medium hover:bg-gray-800">
            Create studio →
          </button>
        </form>
      </div>
    </div>
  )
}
