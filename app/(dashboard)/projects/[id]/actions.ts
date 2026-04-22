"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getCurrentContext } from "@/lib/supabase/current-studio"

export async function updateProjectAction(projectId: string, formData: FormData) {
  const { supabase } = await getCurrentContext()
  const name = String(formData.get("name") || "").trim()
  const status = String(formData.get("status") || "")
  const priority = String(formData.get("priority") || "")
  const budget = formData.get("budget")
  const start_date = formData.get("start_date")
  const end_date = formData.get("end_date")
  const style = String(formData.get("style") || "")
  await supabase
    .from("projects")
    .update({
      name,
      status,
      priority,
      budget: budget ? Number(budget) : null,
      start_date: start_date ? String(start_date) : null,
      end_date: end_date ? String(end_date) : null,
      style: style || null,
    })
    .eq("id", projectId)
  revalidatePath(`/projects/${projectId}`)
}

export async function deleteProjectAction(projectId: string) {
  const { supabase } = await getCurrentContext()
  await supabase.from("projects").delete().eq("id", projectId)
  revalidatePath("/projects")
  redirect("/projects")
}

export async function createTaskAction(projectId: string, formData: FormData) {
  const { supabase } = await getCurrentContext()
  const title = String(formData.get("title") || "").trim()
  if (!title) return
  const priority = String(formData.get("priority") || "normal")
  const due_date = formData.get("due_date")
  await supabase.from("tasks").insert({
    project_id: projectId,
    title,
    priority,
    status: "not_started",
    due_date: due_date ? String(due_date) : null,
  })
  revalidatePath(`/projects/${projectId}`)
}

export async function toggleTaskAction(
  taskId: string,
  projectId: string,
  done: boolean,
) {
  const { supabase } = await getCurrentContext()
  await supabase
    .from("tasks")
    .update({ status: done ? "done" : "not_started" })
    .eq("id", taskId)
  revalidatePath(`/projects/${projectId}`)
}

export async function updateTaskStatusAction(
  taskId: string,
  projectId: string,
  formData: FormData,
) {
  const { supabase } = await getCurrentContext()
  const status = String(formData.get("status") || "not_started")
  await supabase.from("tasks").update({ status }).eq("id", taskId)
  revalidatePath(`/projects/${projectId}`)
}

export async function deleteTaskAction(taskId: string, projectId: string) {
  const { supabase } = await getCurrentContext()
  await supabase.from("tasks").delete().eq("id", taskId)
  revalidatePath(`/projects/${projectId}`)
}

export async function createSpecAction(projectId: string, formData: FormData) {
  const { supabase } = await getCurrentContext()
  const name = String(formData.get("name") || "").trim()
  if (!name) return
  const room = String(formData.get("room") || "")
  const quantity = Number(formData.get("quantity") || 1)
  const unit_price = Number(formData.get("unit_price") || 0)
  await supabase.from("specifications").insert({
    project_id: projectId,
    name,
    room: room || null,
    quantity,
    unit_price,
    status: "specified",
  })
  revalidatePath(`/projects/${projectId}`)
}

export async function updateSpecStatusAction(
  specId: string,
  projectId: string,
  formData: FormData,
) {
  const { supabase } = await getCurrentContext()
  const status = String(formData.get("status") || "specified")
  await supabase.from("specifications").update({ status }).eq("id", specId)
  revalidatePath(`/projects/${projectId}`)
}

export async function deleteSpecAction(specId: string, projectId: string) {
  const { supabase } = await getCurrentContext()
  await supabase.from("specifications").delete().eq("id", specId)
  revalidatePath(`/projects/${projectId}`)
}

export async function createTimeEntryAction(
  projectId: string,
  formData: FormData,
) {
  const { supabase } = await getCurrentContext()
  const minutes = Number(formData.get("minutes") || 0)
  if (!minutes) return
  const note = String(formData.get("note") || "")
  const startAtInput = String(formData.get("start_at") || "")
  const start_at = startAtInput
    ? new Date(startAtInput).toISOString()
    : new Date().toISOString()
  await supabase.from("time_entries").insert({
    project_id: projectId,
    minutes,
    note: note || null,
    start_at,
  })
  revalidatePath(`/projects/${projectId}`)
}

export async function deleteTimeEntryAction(
  entryId: string,
  projectId: string,
) {
  const { supabase } = await getCurrentContext()
  await supabase.from("time_entries").delete().eq("id", entryId)
  revalidatePath(`/projects/${projectId}`)
}

// Documents (BlockNote)
export async function createDocumentAction(
  projectId: string,
  formData: FormData,
) {
  const { supabase, user, studioId } = await getCurrentContext()
  if (!user || !studioId) redirect("/login")
  const title = String(formData.get("title") || "Untitled").trim() || "Untitled"
  const { data, error } = await supabase
    .from("documents")
    .insert({
      studio_id: studioId,
      project_id: projectId,
      title,
      content_json: [],
      created_by: user.id,
    })
    .select("id")
    .single()
  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
  redirect(`/projects/${projectId}?tab=documents&doc=${data.id}`)
}

export async function updateDocumentContentAction(
  docId: string,
  projectId: string,
  contentJson: unknown,
) {
  const { supabase } = await getCurrentContext()
  const { error } = await supabase
    .from("documents")
    .update({ content_json: contentJson, updated_at: new Date().toISOString() })
    .eq("id", docId)
  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
  return { ok: true }
}

export async function renameDocumentAction(
  docId: string,
  projectId: string,
  title: string,
) {
  const { supabase } = await getCurrentContext()
  const { error } = await supabase
    .from("documents")
    .update({ title: title.trim() || "Untitled" })
    .eq("id", docId)
  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
  return { ok: true }
}

export async function deleteDocumentAction(
  docId: string,
  projectId: string,
) {
  const { supabase } = await getCurrentContext()
  await supabase.from("documents").delete().eq("id", docId)
  revalidatePath(`/projects/${projectId}`)
  redirect(`/projects/${projectId}?tab=documents`)
}
