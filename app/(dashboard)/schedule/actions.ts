'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getCurrentContext } from '@/lib/supabase/current-studio'

/**
 * Update a project's start_date and end_date from the Schedule page.
 * Called via form action: schedule row's quick-edit dates form.
 */
export async function updateProjectDatesAction(formData: FormData) {
  const { supabase, user, studioId } = await getCurrentContext()
  if (!user) redirect('/login')

  const project_id = formData.get('project_id') as string
  const start_date = (formData.get('start_date') as string) || null
  const end_date = (formData.get('end_date') as string) || null

  if (!project_id) return

  await supabase
    .from('projects')
    .update({ start_date, end_date })
    .eq('id', project_id)
    .eq('studio_id', studioId)

  revalidatePath('/schedule')
}
