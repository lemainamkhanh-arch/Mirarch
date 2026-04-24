import Link from "next/link"
import { ArrowLeft, Construction } from "lucide-react"
import { getCurrentContext } from "@/lib/supabase/current-studio"
import { DocumentEditorWrapper } from "./document-editor-wrapper"
import { FurnitureScheduleView } from "./furniture-schedule-view"
import { renameModuleAction, deleteModuleAction } from "./actions"

type Mod = {
  id: string
  kind: "document" | "schedule"
  schedule_kind: "ffne" | "gantt" | "generic" | null
  name: string
  document_id: string | null
}

export async function ModuleView({
  projectId,
  mod,
}: {
  projectId: string
  mod: Mod
}) {
  const { supabase } = await getCurrentContext()

  const rename = renameModuleAction.bind(null, mod.id, projectId)
  const del = deleteModuleAction.bind(null, mod.id, projectId)

  let inner: React.ReactNode = null
  if (mod.kind === "document" && mod.document_id) {
    const { data: doc } = await supabase
      .from("documents")
      .select("id,title,content_json,updated_at")
      .eq("id", mod.document_id)
      .maybeSingle()
    if (doc) {
      inner = (
        <DocumentEditorWrapper
          key={doc.id}
          doc={doc as { id: string; title: string; content_json: unknown; updated_at: string | null }}
          projectId={projectId}
        />
      )
    } else {
      inner = (
        <div className="text-sm text-gray-500">
          Document not found. It may have been deleted.
        </div>
      )
    }
  } else if (mod.kind === "schedule" && mod.schedule_kind === "ffne") {
    inner = <FurnitureScheduleView projectId={projectId} moduleId={mod.id} />
  } else if (mod.kind === "schedule") {
    const kindLabel =
      mod.schedule_kind === "gantt" ? "Gantt / Timeline" : "Generic Database"
    inner = (
      <div className="border-2 border-dashed border-gray-200 rounded-sm p-12 text-center">
        <Construction className="w-10 h-10 mx-auto text-gray-300 mb-3" />
        <h3 className="text-base font-medium text-gray-900 mb-1">
          {kindLabel} đang được triển khai
        </h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Module này đã được tạo. UI chi tiết cho {kindLabel.toLowerCase()} sẽ hoàn thiện trong các wave tiếp theo.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href={`/projects/${projectId}`}
            className="text-xs text-gray-500 hover:text-gray-900 inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" /> Overview
          </Link>
          <form action={rename} className="flex items-center gap-2">
            <input
              name="name"
              defaultValue={mod.name}
              className="text-lg font-semibold tracking-tight bg-transparent border-b border-transparent hover:border-gray-300 focus:border-gray-900 focus:outline-none px-1"
            />
            <button
              type="submit"
              className="text-[11px] text-gray-400 hover:text-gray-700"
            >
              Save
            </button>
          </form>
        </div>
        <form action={del}>
          <button
            type="submit"
            className="text-xs text-red-600 hover:text-red-800"
          >
            Delete module
          </button>
        </form>
      </div>
      {inner}
    </div>
  )
}
