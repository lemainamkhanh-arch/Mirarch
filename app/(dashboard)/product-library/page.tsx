import { redirect } from 'next/navigation'
import { Package } from 'lucide-react'
import { getCurrentContext } from '@/lib/supabase/current-studio'

export const dynamic = 'force-dynamic'

export default async function ProductLibraryPage() {
  const { supabase, user, studioId } = await getCurrentContext()
  if (!user) redirect('/login')
  if (!studioId) redirect('/onboarding')

  const { data: products } = await supabase
    .from('assets')
    .select('id, title, storage_path, meta, created_at')
    .eq('studio_id', studioId)
    .eq('kind', 'product')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">Product Library</h1>
      <p className="text-sm text-gray-500 mb-8">Furniture catalog, prices, and purchase links.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {products?.map((p) => {
          const meta = (p.meta ?? {}) as { price?: number; url?: string; supplier?: string }
          return (
            <div key={p.id} className="bg-white border border-gray-100 rounded-sm overflow-hidden">
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                {p.storage_path ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.storage_path as string} alt={(p.title as string) ?? ''} className="w-full h-full object-cover" />
                ) : (
                  <Package className="w-8 h-8 text-gray-300" />
                )}
              </div>
              <div className="p-3">
                <h3 className="text-sm font-medium text-gray-900 truncate">{(p.title as string) ?? 'Untitled'}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{meta.supplier ?? '—'}</p>
                <p className="text-xs text-gray-900 font-medium mt-1">{meta.price ? `$${Number(meta.price).toLocaleString()}` : '—'}</p>
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
