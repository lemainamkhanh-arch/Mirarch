"use client"

import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"

const DocumentEditor = dynamic(
  () => import("./document-editor").then((m) => m.DocumentEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96 text-gray-400 text-sm">
        <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading editor…
      </div>
    ),
  },
)

type Doc = {
  id: string
  title: string
  content_json: unknown
  updated_at: string | null
}

export function DocumentEditorWrapper({
  doc,
  projectId,
}: {
  doc: Doc
  projectId: string
}) {
  return <DocumentEditor doc={doc} projectId={projectId} />
}
