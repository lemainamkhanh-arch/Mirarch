import { redirect } from 'next/navigation'
import { ImageIcon } from 'lucide-react'
import { getCurrentContext } from '@/lib/supabase/current-studio'

export const dynamic = 'force-dynamic'

export default async function ImageLibraryPage() {
  const { supabase, user, studioId } = await getCurrentContext()
  if (!user) redirect('/login')
  if (!studioId) redirect('/onboarding')

  const { data: assets } = await supabase
    .from('assets')
    .select('id, title, storage_path, kind, created_at')
    .eq('studio_id', studioId)
    .in('kind', ['image', 'ai_generated'])
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">Image Library</h1>
      <p className="text-sm text-gray-500 mb-8">Reference images, moodboards, and AI-generated visuals.</p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {assets?.map((a) => (
          <div key={a.id} className="aspect-square bg-gray-100 border border-gray-100 rounded-sm overflow-hidden flex items-center justify-center">
            {a.storage_path ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={a.storage_path as string} alt={(a.title as string) ?? ''} className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-8 h-8 text-gray-300" />
            )}
          </div>
        ))}
        {(!assets || assets.length === 0) && (
          <div className="col-span-full bg-white border-2 border-dashed border-gray-200 rounded-sm py-16 text-center text-sm text-gray-400">
            <ImageIcon className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            Upload your first image to the library.
          </div>
        )}
      </div>
    </div>
  )
}
