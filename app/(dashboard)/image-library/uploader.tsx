'use client'

import { useRef, useState, useTransition } from 'react'
import { Upload, X } from 'lucide-react'
import { uploadImageAction } from './actions'

export function ImageUploader() {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [errors, setErrors] = useState<string[]>([])
  const formRef = useRef<HTMLFormElement>(null)
  const [fileCount, setFileCount] = useState(0)

  async function handleSubmit(fd: FormData) {
    setErrors([])
    startTransition(async () => {
      const res = await uploadImageAction(fd)
      if (res && !res.ok && res.errors) {
        setErrors(res.errors)
        return
      }
      formRef.current?.reset()
      setFileCount(0)
      setOpen(false)
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-gray-800"
      >
        <Upload className="w-4 h-4" />
        Upload Images
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => !pending && setOpen(false)}>
          <div className="bg-white rounded-sm max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Upload images</h2>
                <p className="text-xs text-gray-500 mt-1">JPG / PNG / WebP / GIF / SVG. Max 10MB per file.</p>
              </div>
              <button type="button" onClick={() => !pending && setOpen(false)} className="text-gray-400 hover:text-gray-900">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form ref={formRef} action={handleSubmit} className="space-y-4">
              <label className="block border-2 border-dashed border-gray-200 rounded-sm py-10 px-4 text-center cursor-pointer hover:border-gray-400 transition-colors">
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-700">Click to choose files</p>
                <p className="text-xs text-gray-500 mt-1">{fileCount ? `${fileCount} file(s) selected` : 'You can select multiple'}</p>
                <input
                  type="file"
                  name="files"
                  accept="image/*"
                  multiple
                  onChange={(e) => setFileCount(e.target.files?.length ?? 0)}
                  className="hidden"
                  required
                />
              </label>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tags (comma-separated, optional)</label>
                <input
                  type="text"
                  name="tags"
                  placeholder="moodboard, living-room, japandi"
                  className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm"
                />
              </div>
              {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-sm p-3 text-xs text-red-700 space-y-1">
                  {errors.map((e, i) => (
                    <div key={i}>{e}</div>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={pending}
                  className="px-4 py-2 rounded-sm text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending || fileCount === 0}
                  className="bg-gray-900 text-white px-5 py-2 rounded-sm text-sm font-medium hover:bg-gray-800 disabled:opacity-40"
                >
                  {pending ? 'Uploading…' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
