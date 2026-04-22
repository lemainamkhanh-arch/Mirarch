"use server"

import { revalidatePath } from "next/cache"
import { getCurrentContext } from "@/lib/supabase/current-studio"

export async function updateTaskStatusGlobalAction(
  taskId: string,
  formData: FormData,
) {
  const { supabase } = await getCurrentContext()
  const status = String(formData.get("status") || "not_started")
  await supabase.from("tasks").update({ status }).eq("id", taskId)
  revalidatePath("/todo")
}

export async function deleteTaskGlobalAction(taskId: string) {
  const { supabase } = await getCurrentContext()
  await supabase.from("tasks").delete().eq("id", taskId)
  revalidatePath("/todo")
}

export async function createTaskGlobalAction(formData: FormData) {
  const { supabase } = await getCurrentContext()
  const title = String(formData.get("title") || "").trim()
  const project_id = String(formData.get("project_id") || "")
  if (!title || !project_id) return
  const priority = String(formData.get("priority") || "normal")
  const due_date = formData.get("due_date")
  await supabase.from("tasks").insert({
    project_id,
    title,
    priority,
    status: "not_started",
    due_date: due_date ? String(due_date) : null,
  })
  revalidatePath("/todo")
}
