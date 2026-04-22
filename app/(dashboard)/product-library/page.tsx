import { redirect } from 'next/navigation'
import { Package, Trash2, ExternalLink } from 'lucide-react'
import { getCurrentContext } from '@/lib/supabase/current-studio'
import { ProductUploader } from './uploader'
import { deleteAssetAction } from '../image-library/actions'

export const dynamic = 'force-dynamic'

export default async function ProductLibraryPage() {
  const { supabase, user, studioId } = await getCurrentContext()
  if (!user) redirect('/login')
  if (!studioId) redirect('/onboarding')

  const { data: products } = await supabase
    .from('assets')
    .select('id, name, storage_path, url, metadata, created_at')
    .eq('studio_id', studioId)
    .eq('kind', 'product')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Product Library</h1>
          <p className="text-sm text-gray-500">Furniture catalog, prices, and purchase links.</p>
        </div>
        <ProductUploader />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {products?.map((p) => {
          const meta = (p.metadata ?? {}) as { price?: number; purchase_url?: string; supplier?: string }
          const src = (p.url as string) ?? (p.storage_path as string)
          return (
            <div key={p.id} className="group relative bg-white border border-gray-100 rounded-sm overflow-hidden">
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                {src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt={(p.name as string) ?? ''} className="w-full h-full object-cover" />
                ) : (
                  <Package className="w-8 h-8 text-gray-300" />
                )}
                <form action={deleteAssetAction} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <input type="hidden" name="asset_id" value={p.id as string} />
                  <button
                    type="submit"
                    aria-label="Delete"
                    className="bg-white/90 hover:bg-white p-1 rounded-sm text-gray-700 hover:text-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
              <div className="p-3">
                <h3 className="text-sm font-medium text-gray-900 truncate">{(p.name as string) ?? 'Untitled'}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{meta.supplier ?? '—'}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-900 font-medium">{meta.price ? `$${Number(meta.price).toLocaleString()}` : '—'}</p>
                  {meta.purchase_url && (
                    <a
                      href={meta.purchase_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-gray-400 hover:text-gray-900"
                      aria-label="Open purchase link"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        {(!products || products.length === 0) && (
          <div className="col-span-full bg-white border-2 border-dashed border-gray-200 rounded-sm py-16 text-center text-sm text-gray-400">
            <Package className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            No products in the catalog yet.
          </div>
        )}
      </div>
    </div>
  )
}
