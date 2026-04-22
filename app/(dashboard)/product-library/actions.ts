'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function buildPublicUrl(supabaseUrl: string, path: string) {
  return `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/assets/${path}`
}

export async function uploadProductAction(formData: FormData) {
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
  if (!memb?.studio_id) redirect('/onboarding')

  const file = formData.get('file') as File | null
  const name = String(formData.get('name') ?? '').trim()
  const supplier = String(formData.get('supplier') ?? '').trim()
  const priceRaw = String(formData.get('price') ?? '').trim()
  const purchaseUrl = String(formData.get('purchase_url') ?? '').trim()

  if (!name) return { ok: false, errors: ['Name is required'] }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  let path: string | null = null
  let publicUrl: string | null = null
  let mime: string | null = null
  let sizeBytes: number | null = null

  if (file && file.size > 0) {
    if (!file.type.startsWith('image/')) return { ok: false, errors: ['File must be an image'] }
    if (file.size > 10 * 1024 * 1024) return { ok: false, errors: ['File larger than 10MB'] }
    const ext = (file.name.split('.').pop() ?? 'bin').toLowerCase()
    const safeBase = name.replace(/[^a-zA-Z0-9-_]/g, '-').slice(0, 60)
    path = `${memb.studio_id}/products/${Date.now()}-${safeBase}.${ext}`
    const { error: upErr } = await supabase.storage.from('assets').upload(path, file, {
      contentType: file.type,
      upsert: false,
    })
    if (upErr) return { ok: false, errors: [upErr.message] }
    publicUrl = buildPublicUrl(supabaseUrl, path)
    mime = file.type
    sizeBytes = file.size
  }

  const metadata: Record<string, unknown> = {}
  if (supplier) metadata.supplier = supplier
  if (priceRaw) metadata.price = Number(priceRaw)
  if (purchaseUrl) metadata.purchase_url = purchaseUrl

  const { error: dbErr } = await supabase.from('assets').insert({
    studio_id: memb.studio_id,
    name,
    storage_path: path,
    url: publicUrl,
    mime_type: mime,
    size_bytes: sizeBytes,
    source: 'upload',
    kind: 'product',
    metadata,
    uploaded_by: user.id,
  })
  if (dbErr) {
    if (path) await supabase.storage.from('assets').remove([path])
    return { ok: false, errors: [dbErr.message] }
  }

  revalidatePath('/product-library')
  return { ok: true }
}
