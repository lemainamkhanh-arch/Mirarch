import { X, Plus, ExternalLink } from "lucide-react"
import { addPinboardItemAction, deletePinboardItemAction } from "./actions"

type Item = {
  id: string
  image_url: string | null
  source_url: string | null
  caption: string | null
  kind: "image" | "pinterest_link"
}

export function PinboardSection({
  projectId,
  items,
}: {
  projectId: string
  items: Item[]
}) {
  const addAction = addPinboardItemAction.bind(null, projectId)
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Pinboard
        </h2>
        {items.length > 0 && (
          <span className="text-xs text-gray-400">{items.length} pins</span>
        )}
      </div>
      <div className="grid grid-cols-6 gap-3">
        {items.map((it) => {
          const del = deletePinboardItemAction.bind(null, it.id, projectId)
          return (
            <div
              key={it.id}
              className="relative group aspect-square bg-gray-50 border border-gray-100 rounded-sm overflow-hidden"
            >
              {it.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={it.image_url}
                  alt={it.caption || "Pin"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs p-2 text-center break-all">
                  {it.source_url}
                </div>
              )}
              {it.source_url && (
                <a
                  href={it.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute bottom-1 left-1 opacity-0 group-hover:opacity-100 transition bg-white/90 hover:bg-white border border-gray-200 rounded-full p-1 shadow-sm"
                  aria-label="Open source"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              <form action={del} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition">
                <button
                  type="submit"
                  className="bg-white/90 hover:bg-white border border-gray-200 rounded-full p-1 shadow-sm"
                  aria-label="Remove pin"
                >
                  <X className="w-3 h-3" />
                </button>
              </form>
            </div>
          )
        })}

        <form
          action={addAction}
          className="aspect-square border-2 border-dashed border-gray-200 rounded-sm flex flex-col items-center justify-center gap-1.5 p-2.5 hover:border-gray-300"
        >
          <input
            type="url"
            name="url"
            required
            placeholder="Pinterest link or image URL"
            className="w-full text-[11px] text-center border border-gray-200 rounded-sm px-1.5 py-1 focus:outline-none focus:border-gray-900"
          />
          <input
            type="text"
            name="caption"
            placeholder="Caption (optional)"
            className="w-full text-[11px] text-center border border-gray-200 rounded-sm px-1.5 py-1 focus:outline-none focus:border-gray-900"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1 bg-gray-900 text-white px-2 py-1 rounded-sm text-[11px] font-medium hover:bg-gray-800"
          >
            <Plus className="w-3 h-3" /> Add
          </button>
        </form>
      </div>
    </section>
  )
}
