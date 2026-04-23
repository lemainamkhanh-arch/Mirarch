import { createClient } from './server'

type StudioLite = { name: string; slug: string }

export async function getCurrentContext() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return {
      supabase,
      user: null,
      studioId: null as string | null,
      studioName: null as string | null,
      studioSlug: null as string | null,
      ownerName: null as string | null,
    }
  }
  const { data: memb } = await supabase
    .from('memberships')
    .select('studio_id, studios(name, slug)')
    .eq('user_id', user.id)
    .maybeSingle()

  const rawStudios = (memb as any)?.studios as
    | StudioLite
    | StudioLite[]
    | null
    | undefined
  const studio: StudioLite | null = Array.isArray(rawStudios)
    ? (rawStudios[0] ?? null)
    : (rawStudios ?? null)

  return {
    supabase,
    user,
    studioId: ((memb as any)?.studio_id ?? null) as string | null,
    studioName: studio?.name ?? null,
    studioSlug: studio?.slug ?? null,
    ownerName: (user.user_metadata as any)?.full_name ?? user.email?.split('@')[0] ?? null,
  }
}
