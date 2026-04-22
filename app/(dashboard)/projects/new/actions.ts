'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createProjectAction(formData: FormData) {
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

  const budgetRaw = formData.get('budget')
  const payload = {
    studio_id: memb.studio_id,
    code: String(formData.get('code') ?? '').trim(),
    name: String(formData.get('name') ?? '').trim(),
    status: String(formData.get('status') ?? 'proposal'),
    priority: String(formData.get('priority') ?? 'P2'),
    style: (String(formData.get('style') ?? '').trim() || null) as string | null,
    budget: budgetRaw ? Number(budgetRaw) : null,
    start_date: (formData.get('start_date') as string) || null,
    end_date: (formData.get('end_date') as string) || null,
    currency: 'USD',
  }

  const { data, error } = await supabase.from('projects').insert(payload).select('id').single()
  if (error) throw new Error(error.message)
  redirect(`/projects/${data.id}`)
}
