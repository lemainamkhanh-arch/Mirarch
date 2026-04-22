"use server"

import { revalidatePath } from "next/cache"
import { getCurrentContext } from "@/lib/supabase/current-studio"

export async function createSpecGlobalAction(formData: FormData) {
  const { supabase } = await getCurrentContext()
  const project_id = String(formData.get("project_id") || "")
  const name = String(formData.get("name") || "").trim()
  if (!project_id || !name) return
  await supabase.from("specifications").insert({
    project_id,
    name,
    room: String(formData.get("room") || "") || null,
    quantity: Number(formData.get("quantity") || 1),
    unit_price: Number(formData.get("unit_price") || 0),
    status: "specified",
  })
  revalidatePath("/specifications")
}

export async function deleteSpecGlobalAction(specId: string) {
  const { supabase } = await getCurrentContext()
  await supabase.from("specifications").delete().eq("id", specId)
  revalidatePath("/specifications")
}

export async function updateSpecStatusGlobalAction(
  specId: string,
  formData: FormData,
) {
  const { supabase } = await getCurrentContext()
  const status = String(formData.get("status") || "specified")
  await supabase.from("specifications").update({ status }).eq("id", specId)
  revalidatePath("/specifications")
}
