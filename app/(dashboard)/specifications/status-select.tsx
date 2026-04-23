'use client'

import { useRef } from 'react'

const SPEC_STATUS_COLOR: Record<string, string> = {
  specified: 'bg-gray-100 text-gray-600',
  quoted: 'bg-yellow-100 text-yellow-700',
  client_approved: 'bg-blue-100 text-blue-700',
  ordered: 'bg-purple-100 text-purple-700',
  in_transit: 'bg-orange-100 text-orange-700',
  delivered: 'bg-teal-100 text-teal-700',
  installed: 'bg-green-100 text-green-700',
}

const SPEC_STATUSES = [
  'specified',
  'quoted',
  'client_approved',
  'ordered',
  'in_transit',
  'delivered',
  'installed',
]

export function StatusSelect({ status }: { status: string }) {
  const ref = useRef<HTMLSelectElement>(null)
  return (
    <select
      ref={ref}
      name="status"
      defaultValue={status}
      onChange={() => ref.current?.form?.requestSubmit()}
      className={`text-[11px] font-medium px-2 py-0.5 rounded border-0 cursor-pointer ${
        SPEC_STATUS_COLOR[status] ?? 'bg-gray-100'
      }`}
    >
      {SPEC_STATUSES.map((st) => (
        <option key={st} value={st}>
          {st.replace(/_/g, ' ')}
        </option>
      ))}
    </select>
  )
}
