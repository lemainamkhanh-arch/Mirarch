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

export async function uploadCoverAction(projectId: string, formData: FormData) {
  const { supabase, studioId } = await getCurrentContext()
  const file = formData.get("cover") as File | null
  if (!file || file.size === 0) return

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg"
  const path = `${studioId}/covers/${projectId}-${Date.now()}.${ext}`
  const bytes = await file.arrayBuffer()
  const buffer = new Uint8Array(bytes)

  const { error: uploadErr } = await supabase.storage
    .from("assets")
    .upload(path, buffer, { contentType: file.type, upsert: true })
  if (uploadErr) throw new Error(uploadErr.message)

  const coverUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/assets/${path}`
  await supabase.from("projects").update({ cover_url: coverUrl }).eq("id", projectId)
  revalidatePath(`/projects/${projectId}`)
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
  const lead_time_days_raw = formData.get("lead_time_days")
  const install_date_raw = formData.get("install_date")
  await supabase.from("specifications").insert({
    project_id: projectId,
    name,
    room: room || null,
    quantity,
    unit_price,
    status: "specified",
    lead_time_days: lead_time_days_raw ? Number(lead_time_days_raw) : null,
    install_date: install_date_raw ? String(install_date_raw) : null,
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

// Documents (BlockNote) — also creates a matching project_modules row
export async function createDocumentAction(
  projectId: string,
  formData: FormData,
) {
  const { supabase, user, studioId } = await getCurrentContext()
  if (!user || !studioId) redirect("/login")
  const title = String(formData.get("title") || "Untitled").trim() || "Untitled"
  const { data: doc, error } = await supabase
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
  const { data: mod } = await supabase
    .from("project_modules")
    .insert({
      studio_id: studioId,
      project_id: projectId,
      kind: "document",
      name: title,
      status: "active",
      document_id: doc.id,
      created_by: user.id,
    })
    .select("id")
    .single()
  revalidatePath(`/projects/${projectId}`)
  if (mod?.id) redirect(`/projects/${projectId}?module=${mod.id}`)
  redirect(`/projects/${projectId}?tab=documents&doc=${doc.id}`)
}

export async function updateDocumentContentAction(
  docId: string,
  projectId: string,
  contentJson: unknown,
) {
  const { supabase } = await getCurrentContext()
  const now = new Date().toISOString()
  const { error } = await supabase
    .from("documents")
    .update({ content_json: contentJson, updated_at: now })
    .eq("id", docId)
  if (error) throw new Error(error.message)
  await supabase
    .from("project_modules")
    .update({ updated_at: now })
    .eq("document_id", docId)
  revalidatePath(`/projects/${projectId}`)
  return { ok: true }
}

export async function renameDocumentAction(
  docId: string,
  projectId: string,
  title: string,
) {
  const { supabase } = await getCurrentContext()
  const t = title.trim() || "Untitled"
  const { error } = await supabase
    .from("documents")
    .update({ title: t })
    .eq("id", docId)
  if (error) throw new Error(error.message)
  await supabase
    .from("project_modules")
    .update({ name: t, updated_at: new Date().toISOString() })
    .eq("document_id", docId)
  revalidatePath(`/projects/${projectId}`)
  return { ok: true }
}

export async function deleteDocumentAction(
  docId: string,
  projectId: string,
) {
  const { supabase } = await getCurrentContext()
  await supabase.from("project_modules").delete().eq("document_id", docId)
  await supabase.from("documents").delete().eq("id", docId)
  revalidatePath(`/projects/${projectId}`)
  redirect(`/projects/${projectId}`)
}

// ===== Project Modules =====

export async function createModuleAction(projectId: string, formData: FormData) {
  const { supabase, user, studioId } = await getCurrentContext()
  if (!user || !studioId) redirect("/login")
  const kind = String(formData.get("kind") || "") as "document" | "schedule"
  const schedule_kind_raw = String(formData.get("schedule_kind") || "")
  const name = String(formData.get("name") || "").trim() || "Untitled"

  if (kind === "document") {
    const { data: doc, error: docErr } = await supabase
      .from("documents")
      .insert({
        studio_id: studioId,
        project_id: projectId,
        title: name,
        content_json: [],
        created_by: user.id,
      })
      .select("id")
      .single()
    if (docErr) throw new Error(docErr.message)
    const { data: mod, error: modErr } = await supabase
      .from("project_modules")
      .insert({
        studio_id: studioId,
        project_id: projectId,
        kind: "document",
        name,
        status: "active",
        document_id: doc.id,
        created_by: user.id,
      })
      .select("id")
      .single()
    if (modErr) throw new Error(modErr.message)
    revalidatePath(`/projects/${projectId}`)
    redirect(`/projects/${projectId}?module=${mod.id}`)
  }

  if (kind === "schedule") {
    const schedule_kind = (["ffne", "gantt", "generic"].includes(schedule_kind_raw)
      ? schedule_kind_raw
      : "generic") as "ffne" | "gantt" | "generic"
    const { data: mod, error } = await supabase
      .from("project_modules")
      .insert({
        studio_id: studioId,
        project_id: projectId,
        kind: "schedule",
        schedule_kind,
        name,
        status: "active",
        created_by: user.id,
      })
      .select("id")
      .single()
    if (error) throw new Error(error.message)
    revalidatePath(`/projects/${projectId}`)
    redirect(`/projects/${projectId}?module=${mod.id}`)
  }
}

export async function renameModuleAction(
  moduleId: string,
  projectId: string,
  formData: FormData,
) {
  const { supabase } = await getCurrentContext()
  const name = String(formData.get("name") || "").trim() || "Untitled"
  const now = new Date().toISOString()
  const { data: mod } = await supabase
    .from("project_modules")
    .update({ name, updated_at: now })
    .eq("id", moduleId)
    .select("kind, document_id")
    .single()
  if (mod?.kind === "document" && mod.document_id) {
    await supabase
      .from("documents")
      .update({ title: name })
      .eq("id", mod.document_id)
  }
  revalidatePath(`/projects/${projectId}`)
}

export async function updateModuleStatusAction(
  moduleId: string,
  projectId: string,
  formData: FormData,
) {
  const { supabase } = await getCurrentContext()
  const status = String(formData.get("status") || "active")
  await supabase
    .from("project_modules")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", moduleId)
  revalidatePath(`/projects/${projectId}`)
}

export async function deleteModuleAction(moduleId: string, projectId: string) {
  const { supabase } = await getCurrentContext()
  const { data: mod } = await supabase
    .from("project_modules")
    .select("kind, document_id")
    .eq("id", moduleId)
    .maybeSingle()
  await supabase.from("project_modules").delete().eq("id", moduleId)
  if (mod?.kind === "document" && mod.document_id) {
    await supabase.from("documents").delete().eq("id", mod.document_id)
  }
  revalidatePath(`/projects/${projectId}`)
  redirect(`/projects/${projectId}`)
}

// ===== Pinboard =====

async function extractPinImage(
  url: string,
): Promise<{ image_url: string; source_url: string }> {
  const trimmed = url.trim()
  if (/\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(trimmed)) {
    return { image_url: trimmed, source_url: trimmed }
  }
  try {
    const res = await fetch(trimmed, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; MirarchBot/1.0; +https://mirarch.app)",
      },
      redirect: "follow",
    })
    const html = await res.text()
    const og =
      html.match(
        /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
      ) ||
      html.match(
        /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
      )
    if (og && og[1]) return { image_url: og[1], source_url: trimmed }
  } catch {}
  return { image_url: trimmed, source_url: trimmed }
}

export async function addPinboardItemAction(
  projectId: string,
  formData: FormData,
) {
  const { supabase, user, studioId } = await getCurrentContext()
  if (!user || !studioId) redirect("/login")
  const rawUrl = String(formData.get("url") || "").trim()
  const caption = String(formData.get("caption") || "").trim()
  if (!rawUrl) return
  const { image_url, source_url } = await extractPinImage(rawUrl)
  const isPinterest = /pinterest\.com|pinimg\.com/i.test(source_url)
  await supabase.from("pinboard_items").insert({
    studio_id: studioId,
    project_id: projectId,
    kind: isPinterest ? "pinterest_link" : "image",
    image_url,
    source_url,
    caption: caption || null,
    created_by: user.id,
  })
  revalidatePath(`/projects/${projectId}`)
}

export async function deletePinboardItemAction(
  itemId: string,
  projectId: string,
) {
  const { supabase } = await getCurrentContext()
  await supabase.from("pinboard_items").delete().eq("id", itemId)
  revalidatePath(`/projects/${projectId}`)
}
