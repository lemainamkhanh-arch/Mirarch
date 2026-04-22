import Link from "next/link"
import { FileText, Plus, Trash2 } from "lucide-react"
import { createDocumentAction, deleteDocumentAction } from "./actions"
import { DocumentEditorWrapper } from "./document-editor-wrapper"

type DocRow = {
  id: string
  title: string
  content_json: unknown
  updated_at: string | null
}

export function DocumentsTab({
  projectId,
  documents,
  activeDocId,
}: {
  projectId: string
  documents: DocRow[]
  activeDocId?: string
}) {
  const activeDoc = activeDocId
    ? documents.find((d) => d.id === activeDocId)
    : documents[0]

  const createWithProject = createDocumentAction.bind(null, projectId)

  return (
    <div className="grid grid-cols-[240px_1fr] gap-4">
      <aside className="border border-gray-100 rounded-sm bg-white p-3 h-fit">
        <form action={createWithProject} className="mb-3">
          <input type="hidden" name="title" value="Untitled" />
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-3 py-2 rounded-sm text-xs font-medium hover:bg-gray-800"
          >
            <Plus className="w-3.5 h-3.5" /> New document
          </button>
        </form>
        <ul className="space-y-0.5">
          {documents.map((d) => {
            const isActive = (activeDoc?.id ?? null) === d.id
            return (
              <li key={d.id}>
                <Link
                  href={`/projects/${projectId}?tab=documents&doc=${d.id}`}
                  className={`group flex items-center gap-2 px-2 py-1.5 rounded-sm text-xs ${
                    isActive
                      ? "bg-gray-100 text-gray-900 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                  <span className="truncate flex-1">{d.title || "Untitled"}</span>
                </Link>
              </li>
            )
          })}
          {documents.length === 0 && (
            <li className="text-xs text-gray-400 px-2 py-3 text-center">
              No documents yet.
            </li>
          )}
        </ul>
      </aside>
      <div className="min-w-0">
        {activeDoc ? (
          <DocumentEditorWrapper
            key={activeDoc.id}
            doc={activeDoc}
            projectId={projectId}
          />
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-sm">
            <FileText className="w-8 h-8 mx-auto text-gray-300 mb-2" />
            <div className="text-sm text-gray-700 font-medium mb-1">
              No documents yet
            </div>
            <div className="text-xs text-gray-500 mb-4">
              Create your first concept brief, meeting note, or proposal draft.
            </div>
            <form action={createWithProject}>
              <input type="hidden" name="title" value="Untitled" />
              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-sm text-xs font-medium hover:bg-gray-800"
              >
                <Plus className="w-3.5 h-3.5" /> New document
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

// re-export so old imports using deleteDocumentAction from here keep working if any
export { deleteDocumentAction, Trash2 }
