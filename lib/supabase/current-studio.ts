import { createClient } from './server'

export async function getCurrentContext() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { supabase, user: null, studioId: null as string | null }
  }
  const { data: memb } = await supabase
    .from('memberships')
    .select('studio_id')
    .eq('user_id', user.id)
    .maybeSingle()
  return {
    supabase,
    user,
    studioId: (memb?.studio_id ?? null) as string | null,
  }
}
