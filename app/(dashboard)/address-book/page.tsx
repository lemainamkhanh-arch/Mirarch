import { redirect } from "next/navigation"
import { Mail, Phone, MapPin, Plus, Pencil, Trash2 } from "lucide-react"
import { getCurrentContext } from "@/lib/supabase/current-studio"
import {
  createContactAction,
  updateContactAction,
  deleteContactAction,
} from "./actions"

export const dynamic = "force-dynamic"

const KIND_COLOR: Record<string, string> = {
  client: "bg-blue-100 text-blue-700",
  supplier: "bg-purple-100 text-purple-700",
  contractor: "bg-orange-100 text-orange-700",
  collaborator: "bg-green-100 text-green-700",
  other: "bg-gray-100 text-gray-700",
}

const KINDS = ["client", "supplier", "contractor", "collaborator", "other"]

type Contact = {
  id: string
  name: string
  kind: string
  email: string | null
  phone: string | null
  address: string | null
  note: string | null
}

function ContactForm({
  action,
  contact,
  cancelHref,
}: {
  action: (fd: FormData) => Promise<void>
  contact?: Contact
  cancelHref: string
}) {
  return (
    <form
      action={action}
      className="bg-white border border-gray-200 rounded-sm p-6 mb-6 grid grid-cols-2 gap-4"
    >
      <div className="col-span-2 flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-gray-900">
          {contact ? "Edit Contact" : "New Contact"}
        </h2>
        <a href={cancelHref} className="text-xs text-gray-500 hover:text-gray-900">
          Cancel
        </a>
      </div>
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Name *</label>
        <input
          name="name"
          defaultValue={contact?.name}
          required
          className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm"
          placeholder="Studio ABC"
        />
      </div>
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Type</label>
        <select
          name="kind"
          defaultValue={contact?.kind ?? "client"}
          className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm"
        >
          {KINDS.map((k) => (
            <option key={k} value={k}>
              {k.charAt(0).toUpperCase() + k.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Email</label>
        <input
          name="email"
          type="email"
          defaultValue={contact?.email ?? ""}
          className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm"
          placeholder="name@email.com"
        />
      </div>
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Phone</label>
        <input
          name="phone"
          defaultValue={contact?.phone ?? ""}
          className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm"
          placeholder="+84 ..."
        />
      </div>
      <div className="col-span-2">
        <label className="text-xs text-gray-500 mb-1 block">Address</label>
        <input
          name="address"
          defaultValue={contact?.address ?? ""}
          className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm"
          placeholder="123 Nguyen Hue, Ho Chi Minh City"
        />
      </div>
      <div className="col-span-2">
        <label className="text-xs text-gray-500 mb-1 block">Note</label>
        <textarea
          name="note"
          defaultValue={contact?.note ?? ""}
          rows={2}
          className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm resize-none"
          placeholder="Additional notes…"
        />
      </div>
      <div className="col-span-2 flex justify-end">
        <button
          type="submit"
          className="bg-gray-900 text-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-gray-800"
        >
          {contact ? "Save changes" : "Add contact"}
        </button>
      </div>
    </form>
  )
}

export default async function AddressBookPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string }>
}) {
  const { supabase, user, studioId } = await getCurrentContext()
  if (!user) redirect("/login")
  if (!studioId) redirect("/onboarding")

  const sp = await searchParams
  const isNew = sp.action === "new"
  const editId = sp.action?.startsWith("edit:") ? sp.action.slice(5) : null

  const { data: contacts } = await supabase
    .from("contacts")
    .select("*")
    .eq("studio_id", studioId)
    .order("name", { ascending: true })

  const editContact = editId
    ? (contacts?.find((c) => c.id === editId) as Contact | undefined)
    : undefined

  const updateWithId = editId
    ? updateContactAction.bind(null, editId)
    : null

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Address Book</h1>
          <p className="text-sm text-gray-500">
            Clients, suppliers, contractors, and collaborators.
          </p>
        </div>
        {!isNew && !editId && (
          <a
            href="/address-book?action=new"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-gray-800"
          >
            <Plus className="w-4 h-4" /> Add Contact
          </a>
        )}
      </div>

      {isNew && (
        <ContactForm action={createContactAction} cancelHref="/address-book" />
      )}
      {editId && editContact && updateWithId && (
        <ContactForm
          action={updateWithId}
          contact={editContact}
          cancelHref="/address-book"
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(contacts as Contact[])?.map((c) => {
          const deleteAction = deleteContactAction.bind(null, c.id)
          return (
            <div
              key={c.id}
              className="bg-white border border-gray-100 rounded-sm p-5 group"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">{c.name}</h3>
                <div className="flex items-center gap-1">
                  <span
                    className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${
                      KIND_COLOR[c.kind] ?? KIND_COLOR.other
                    }`}
                  >
                    {c.kind}
                  </span>
                  <a
                    href={`/address-book?action=edit:${c.id}`}
                    className="p-1 text-gray-300 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Pencil className="w-3 h-3" />
                  </a>
                  <form action={deleteAction}>
                    <button
                      type="submit"
                      className="p-1 text-gray-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </form>
                </div>
              </div>
              {c.email && (
                <p className="text-xs text-gray-600 flex items-center gap-1.5 mb-1">
                  <Mail className="w-3 h-3" />
                  <a href={`mailto:${c.email}`} className="hover:underline">
                    {c.email}
                  </a>
                </p>
              )}
              {c.phone && (
                <p className="text-xs text-gray-600 flex items-center gap-1.5 mb-1">
                  <Phone className="w-3 h-3" />
                  <a href={`tel:${c.phone}`} className="hover:underline">
                    {c.phone}
                  </a>
                </p>
              )}
              {c.address && (
                <p className="text-xs text-gray-600 flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" /> {c.address}
                </p>
              )}
              {c.note && (
                <p className="text-xs text-gray-400 mt-2 border-t border-gray-50 pt-2">
                  {c.note}
                </p>
              )}
            </div>
          )
        })}
        {(!contacts || contacts.length === 0) && !isNew && (
          <p className="text-sm text-gray-400 col-span-full text-center py-10">
            No contacts yet.{" "}
            <a href="/address-book?action=new" className="underline text-gray-600">
              Add the first one.
            </a>
          </p>
        )}
      </div>
    </div>
  )
}
