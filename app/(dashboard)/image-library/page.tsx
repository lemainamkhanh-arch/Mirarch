import { redirect } from 'next/navigation'
import { ImageIcon, Trash2 } from 'lucide-react'
import { getCurrentContext } from '@/lib/supabase/current-studio'
import { ImageUploader } from './uploader'
import { deleteAssetAction } from './actions'

export const dynamic = 'force-dynamic'

export default async function ImageLibraryPage() {
  const { supabase, user, studioId } = await getCurrentContext()
  if (!user) redirect('/login')
  if (!studioId) redirect('/onboarding')

  const { data: assets } = await supabase
    .from('assets')
    .select('id, name, storage_path, url, kind, tags, created_at')
    .eq('studio_id', studioId)
    .in('kind', ['image', 'ai_generated'])
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Image Library</h1>
          <p className="text-sm text-gray-500">Reference images, moodboards, and AI-generated visuals.</p>
        </div>
        <ImageUploader />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {assets?.map((a) => {
          const src = (a.url as string) ?? (a.storage_path as string)
          return (
            <div key={a.id} className="group relative aspect-square bg-gray-100 border border-gray-100 rounded-sm overflow-hidden flex items-center justify-center">
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt={(a.name as string) ?? ''} className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-8 h-8 text-gray-300" />
              )}
              {a.kind === 'ai_generated' && (
                <span className="absolute top-2 left-2 bg-gray-900 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-sm">AI</span>
              )}
              <form action={deleteAssetAction} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <input type="hidden" name="asset_id" value={a.id as string} />
                <button
                  type="submit"
                  aria-label="Delete"
                  className="bg-white/90 hover:bg-white p-1 rounded-sm text-gray-700 hover:text-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </form>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent text-white text-[10px] px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity truncate">
                {(a.name as string) ?? 'Untitled'}
              </div>
            </div>
          )
        })}
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
