"use server"

import { revalidatePath } from "next/cache"
import { getCurrentContext } from "@/lib/supabase/current-studio"

export async function createTimeEntryGlobalAction(formData: FormData) {
  const { supabase } = await getCurrentContext()
  const project_id = String(formData.get("project_id") || "")
  const minutes = Number(formData.get("minutes") || 0)
  if (!project_id || !minutes) return
  const note = String(formData.get("note") || "") || null
  const startAtInput = String(formData.get("start_at") || "")
  const start_at = startAtInput
    ? new Date(startAtInput).toISOString()
    : new Date().toISOString()
  await supabase.from("time_entries").insert({
    project_id,
    minutes,
    note,
    start_at,
  })
  revalidatePath("/time-tracking")
}

export async function deleteTimeEntryGlobalAction(entryId: string) {
  const { supabase } = await getCurrentContext()
  await supabase.from("time_entries").delete().eq("id", entryId)
  revalidatePath("/time-tracking")
}
