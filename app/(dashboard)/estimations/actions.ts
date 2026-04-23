'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getCurrentContext } from '@/lib/supabase/current-studio'

export async function createEstimateAction(formData: FormData) {
  const { supabase, user, studioId } = await getCurrentContext()
  if (!user) redirect('/login')

  const project_id = (formData.get('project_id') as string) || null
  const title = String(formData.get('title') ?? 'Dự toán').trim() || 'Dự toán'
  const currency = String(formData.get('currency') ?? 'VND')

  const { data, error } = await supabase
    .from('estimates')
    .insert({ studio_id: studioId, project_id, title, currency, created_by: user.id })
    .select('id')
    .single()
  if (error) throw new Error(error.message)
  revalidatePath('/estimations')
  redirect(`/estimations/${data.id}`)
}

export async function deleteEstimateAction(id: string) {
  const { supabase, studioId } = await getCurrentContext()
  await supabase.from('estimates').delete().eq('id', id).eq('studio_id', studioId)
  revalidatePath('/estimations')
}

export async function createEstimateSectionAction(formData: FormData) {
  const { supabase } = await getCurrentContext()
  const estimate_id = formData.get('estimate_id') as string
  const name = String(formData.get('name') ?? '').trim()
  if (!name || !estimate_id) return
  const { count } = await supabase
    .from('estimate_sections')
    .select('*', { count: 'exact', head: true })
    .eq('estimate_id', estimate_id)
  await supabase.from('estimate_sections').insert({ estimate_id, name, sort_order: count ?? 0 })
  revalidatePath(`/estimations/${estimate_id}`)
}

export async function deleteEstimateSectionAction(id: string, estimateId: string) {
  const { supabase } = await getCurrentContext()
  await supabase.from('estimate_sections').delete().eq('id', id)
  revalidatePath(`/estimations/${estimateId}`)
}

export async function createEstimateItemAction(formData: FormData) {
  const { supabase } = await getCurrentContext()
  const estimate_id = formData.get('estimate_id') as string
  const section_id = (formData.get('section_id') as string) || null
  const description = String(formData.get('description') ?? '').trim()
  const unit = String(formData.get('unit') ?? 'cái').trim() || 'cái'
  const quantity = Number(formData.get('quantity') ?? 1) || 1
  const unit_price = Number(formData.get('unit_price') ?? 0)
  const markup_pct = Number(formData.get('markup_pct') ?? 0)
  if (!description || !estimate_id) return
  await supabase.from('estimate_items').insert({
    estimate_id,
    section_id,
    description,
    unit,
    quantity,
    unit_price,
    markup_pct,
  })
  revalidatePath(`/estimations/${estimate_id}`)
}

export async function deleteEstimateItemAction(id: string, estimateId: string) {
  const { supabase } = await getCurrentContext()
  await supabase.from('estimate_items').delete().eq('id', id)
  revalidatePath(`/estimations/${estimateId}`)
}

export async function updateEstimateStatusAction(id: string, newStatus: string) {
  const { supabase, studioId } = await getCurrentContext()
  const update: Record<string, unknown> = { status: newStatus, updated_at: new Date().toISOString() }
  if (newStatus === 'sent') update.sent_at = new Date().toISOString()
  if (newStatus === 'approved') update.approved_at = new Date().toISOString()
  await supabase.from('estimates').update(update).eq('id', id).eq('studio_id', studioId)
  revalidatePath(`/estimations/${id}`)
  revalidatePath('/estimations')
}

export async function updateEstimateVatAction(id: string, vat_pct: number, contingency_pct: number) {
  const { supabase, studioId } = await getCurrentContext()
  await supabase
    .from('estimates')
    .update({ vat_pct, contingency_pct, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('studio_id', studioId)
  revalidatePath(`/estimations/${id}`)
}
