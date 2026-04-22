'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createStudioAction(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const name = String(formData.get('name') ?? '').trim()
  const slug = String(formData.get('slug') ?? '').trim().toLowerCase()
  const timezone = String(formData.get('timezone') ?? 'UTC')
  const locale = String(formData.get('locale') ?? 'en')

  if (!name || !slug) {
    throw new Error('Name and slug are required')
  }

  const { error } = await supabase.from('studios').insert({
    name,
    slug,
    timezone,
    locale,
    owner_id: user.id,
  })
  if (error) throw new Error(error.message)

  // Trigger handle_new_studio auto-creates the membership row.
  redirect('/dashboard')
}
