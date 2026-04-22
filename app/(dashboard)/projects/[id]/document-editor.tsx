"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { useCreateBlockNote } from "@blocknote/react"
import { BlockNoteView } from "@blocknote/mantine"
import type { Block, PartialBlock } from "@blocknote/core"
import "@blocknote/core/fonts/inter.css"
import "@blocknote/mantine/style.css"
import { Save, Check, Loader2 } from "lucide-react"
import {
  renameDocumentAction,
  updateDocumentContentAction,
  deleteDocumentAction,
} from "./actions"

type Doc = {
  id: string
  title: string
  content_json: unknown
  updated_at: string | null
}

type SaveState = "idle" | "saving" | "saved" | "error"

export function DocumentEditor({
  doc,
  projectId,
}: {
  doc: Doc
  projectId: string
}) {
  const initial = Array.isArray(doc.content_json) && doc.content_json.length > 0
    ? (doc.content_json as PartialBlock[])
    : undefined

  const editor = useCreateBlockNote({ initialContent: initial })

  const [title, setTitle] = useState(doc.title)
  const [saveState, setSaveState] = useState<SaveState>("idle")
  const [dirty, setDirty] = useState(false)
  const [, startTransition] = useTransition()
  const lastSavedAtRef = useRef<string | null>(doc.updated_at)

  useEffect(() => {
    setTitle(doc.title)
    setDirty(false)
    setSaveState("idle")
  }, [doc.id, doc.title])

  async function handleSave() {
    setSaveState("saving")
    try {
      const blocks: Block[] = editor.document
      const trimmedTitle = title.trim() || "Untitled"
      await Promise.all([
        updateDocumentContentAction(doc.id, projectId, blocks),
        trimmedTitle !== doc.title
          ? renameDocumentAction(doc.id, projectId, trimmedTitle)
          : Promise.resolve(),
      ])
      lastSavedAtRef.current = new Date().toISOString()
      setDirty(false)
      setSaveState("saved")
      setTimeout(() => setSaveState((s) => (s === "saved" ? "idle" : s)), 1500)
    } catch (err) {
      console.error(err)
      setSaveState("error")
    }
  }

  // Ctrl/Cmd+S shortcut
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault()
        if (dirty) void handleSave()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirty, title, doc.id])

  function handleDelete() {
    if (!confirm("Delete this document?")) return
    startTransition(async () => {
      await deleteDocumentAction(doc.id, projectId)
    })
  }

  return (
    <div className="flex flex-col h-[calc(100vh-18rem)] min-h-[480px]">
      <div className="flex items-center justify-between gap-3 mb-3 px-1">
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            setDirty(true)
          }}
          onBlur={() => {
            if (dirty) void handleSave()
          }}
          placeholder="Untitled"
          className="flex-1 text-xl font-semibold bg-transparent border-0 outline-none focus:ring-0 placeholder:text-gray-300"
        />
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {saveState === "saving" && (
            <span className="flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Saving…
            </span>
          )}
          {saveState === "saved" && (
            <span className="flex items-center gap-1 text-green-600">
              <Check className="w-3 h-3" /> Saved
            </span>
          )}
          {saveState === "error" && (
            <span className="text-red-600">Save failed</span>
          )}
          {saveState === "idle" && dirty && (
            <span className="text-amber-600">Unsaved</span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={!dirty || saveState === "saving"}
            className="inline-flex items-center gap-1.5 bg-gray-900 text-white px-3 py-1.5 rounded-sm text-xs font-medium hover:bg-gray-800 disabled:opacity-40"
          >
            <Save className="w-3.5 h-3.5" /> Save
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="text-gray-400 hover:text-red-600 px-2 py-1 rounded-sm text-xs"
          >
            Delete
          </button>
        </div>
      </div>
      <div
        className="flex-1 overflow-auto bg-white border border-gray-100 rounded-sm"
        onBlur={() => {
          if (dirty) void handleSave()
        }}
      >
        <BlockNoteView
          editor={editor}
          theme="light"
          onChange={() => setDirty(true)}
        />
      </div>
    </div>
  )
}
