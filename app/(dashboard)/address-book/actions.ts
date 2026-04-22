"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getCurrentContext } from "@/lib/supabase/current-studio"

export async function createContactAction(formData: FormData) {
  const { supabase, studioId } = await getCurrentContext()
  if (!studioId) redirect("/login")
  const name = String(formData.get("name") || "").trim()
  if (!name) return
  await supabase.from("contacts").insert({
    studio_id: studioId,
    name,
    kind: String(formData.get("kind") || "other"),
    email: String(formData.get("email") || "") || null,
    phone: String(formData.get("phone") || "") || null,
    address: String(formData.get("address") || "") || null,
    note: String(formData.get("note") || "") || null,
  })
  revalidatePath("/address-book")
  redirect("/address-book")
}

export async function updateContactAction(contactId: string, formData: FormData) {
  const { supabase } = await getCurrentContext()
  const name = String(formData.get("name") || "").trim()
  if (!name) return
  await supabase
    .from("contacts")
    .update({
      name,
      kind: String(formData.get("kind") || "other"),
      email: String(formData.get("email") || "") || null,
      phone: String(formData.get("phone") || "") || null,
      address: String(formData.get("address") || "") || null,
      note: String(formData.get("note") || "") || null,
    })
    .eq("id", contactId)
  revalidatePath("/address-book")
  redirect("/address-book")
}

export async function deleteContactAction(contactId: string) {
  const { supabase } = await getCurrentContext()
  await supabase.from("contacts").delete().eq("id", contactId)
  revalidatePath("/address-book")
}
