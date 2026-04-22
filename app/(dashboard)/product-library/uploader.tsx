'use client'

import { useRef, useState, useTransition } from 'react'
import { Plus, X } from 'lucide-react'
import { uploadProductAction } from './actions'

export function ProductUploader() {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [errors, setErrors] = useState<string[]>([])
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(fd: FormData) {
    setErrors([])
    startTransition(async () => {
      const res = await uploadProductAction(fd)
      if (res && !res.ok && res.errors) {
        setErrors(res.errors)
        return
      }
      formRef.current?.reset()
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
        <Plus className="w-4 h-4" />
        Add Product
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => !pending && setOpen(false)}>
          <div className="bg-white rounded-sm max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Add product</h2>
                <p className="text-xs text-gray-500 mt-1">Catalog item with price & supplier. Image optional.</p>
              </div>
              <button type="button" onClick={() => !pending && setOpen(false)} className="text-gray-400 hover:text-gray-900">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form ref={formRef} action={handleSubmit} className="space-y-3">
              <Field label="Name" name="name" required placeholder="Lounge chair — walnut" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Supplier" name="supplier" placeholder="District 8" />
                <Field label="Price (USD)" name="price" type="number" step="0.01" placeholder="450" />
              </div>
              <Field label="Purchase URL" name="purchase_url" type="url" placeholder="https://..." />
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Image (optional)</label>
                <input
                  type="file"
                  name="file"
                  accept="image/*"
                  className="w-full text-xs file:bg-gray-900 file:text-white file:border-0 file:rounded-sm file:px-3 file:py-1.5 file:mr-3 file:text-xs file:cursor-pointer"
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
                  disabled={pending}
                  className="bg-gray-900 text-white px-5 py-2 rounded-sm text-sm font-medium hover:bg-gray-800 disabled:opacity-40"
                >
                  {pending ? 'Saving…' : 'Save product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

type FieldProps = {
  label: string
  name: string
  type?: string
  placeholder?: string
  required?: boolean
  step?: string
}

function Field({ label, name, type = 'text', placeholder, required, step }: FieldProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        step={step}
        className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-gray-900"
      />
    </div>
  )
}
