import { redirect } from 'next/navigation'
import { Mail, Phone, MapPin } from 'lucide-react'
import { getCurrentContext } from '@/lib/supabase/current-studio'

export const dynamic = 'force-dynamic'

const KIND_COLOR: Record<string, string> = {
  client: 'bg-blue-100 text-blue-700',
  supplier: 'bg-purple-100 text-purple-700',
  contractor: 'bg-orange-100 text-orange-700',
  collaborator: 'bg-green-100 text-green-700',
  other: 'bg-gray-100 text-gray-700',
}

export default async function AddressBookPage() {
  const { supabase, user, studioId } = await getCurrentContext()
  if (!user) redirect('/login')
  if (!studioId) redirect('/onboarding')

  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .eq('studio_id', studioId)
    .order('name', { ascending: true })

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">Address Book</h1>
      <p className="text-sm text-gray-500 mb-8">Clients, suppliers, contractors, and collaborators.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contacts?.map((c: Record<string, unknown>) => (
          <div key={c.id as string} className="bg-white border border-gray-100 rounded-sm p-5">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">{c.name as string}</h3>
              <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${KIND_COLOR[c.kind as string] ?? KIND_COLOR.other}`}>{c.kind as string}</span>
            </div>
            {c.email ? (
              <p className="text-xs text-gray-600 flex items-center gap-1.5 mb-1"><Mail className="w-3 h-3" /> {c.email as string}</p>
            ) : null}
            {c.phone ? (
              <p className="text-xs text-gray-600 flex items-center gap-1.5 mb-1"><Phone className="w-3 h-3" /> {c.phone as string}</p>
            ) : null}
            {c.address ? (
              <p className="text-xs text-gray-600 flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {c.address as string}</p>
            ) : null}
          </div>
        ))}
        {(!contacts || contacts.length === 0) && (
          <p className="text-sm text-gray-400 col-span-full text-center py-10">No contacts yet.</p>
        )}
      </div>
    </div>
  )
}
