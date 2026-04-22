'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function buildPublicUrl(supabaseUrl: string, path: string) {
  return `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/assets/${path}`
}

export async function uploadImageAction(formData: FormData) {
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

  const files = formData.getAll('files') as File[]
  const projectIdRaw = String(formData.get('project_id') ?? '').trim()
  const tagsRaw = String(formData.get('tags') ?? '').trim()
  const tags = tagsRaw ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean) : null

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const errors: string[] = []

  for (const file of files) {
    if (!file || file.size === 0) continue
    if (!file.type.startsWith('image/')) {
      errors.push(`${file.name}: not an image`)
      continue
    }
    if (file.size > 10 * 1024 * 1024) {
      errors.push(`${file.name}: larger than 10MB`)
      continue
    }
    const ext = (file.name.split('.').pop() ?? 'bin').toLowerCase()
    const safeBase = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '-').slice(0, 60)
    const path = `${memb.studio_id}/${Date.now()}-${safeBase}.${ext}`

    const { error: upErr } = await supabase.storage.from('assets').upload(path, file, {
      contentType: file.type,
      upsert: false,
    })
    if (upErr) {
      errors.push(`${file.name}: ${upErr.message}`)
      continue
    }

    const publicUrl = buildPublicUrl(supabaseUrl, path)
    const { error: dbErr } = await supabase.from('assets').insert({
      studio_id: memb.studio_id,
      project_id: projectIdRaw || null,
      name: file.name,
      storage_path: path,
      url: publicUrl,
      mime_type: file.type,
      size_bytes: file.size,
      tags,
      source: 'upload',
      kind: 'image',
      uploaded_by: user.id,
    })
    if (dbErr) {
      errors.push(`${file.name}: ${dbErr.message}`)
      await supabase.storage.from('assets').remove([path])
    }
  }

  revalidatePath('/image-library')
  if (errors.length) {
    return { ok: false, errors }
  }
  return { ok: true }
}

export async function deleteAssetAction(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const assetId = String(formData.get('asset_id') ?? '')
  if (!assetId) return

  const { data: asset } = await supabase
    .from('assets')
    .select('storage_path, kind')
    .eq('id', assetId)
    .maybeSingle()

  if (asset?.storage_path) {
    await supabase.storage.from('assets').remove([asset.storage_path as string])
  }
  await supabase.from('assets').delete().eq('id', assetId)

  revalidatePath('/image-library')
  revalidatePath('/product-library')
}
