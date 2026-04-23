'use client'

import { useRef } from 'react'

const STATUS_COLOR: Record<string, string> = {
  not_started: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  blocked: 'bg-red-100 text-red-700',
  done: 'bg-green-100 text-green-700',
  archived: 'bg-gray-100 text-gray-400',
}

const STATUSES = ['not_started', 'in_progress', 'blocked', 'done', 'archived']

export function StatusSelect({ status }: { status: string }) {
  const ref = useRef<HTMLSelectElement>(null)
  return (
    <select
      ref={ref}
      name="status"
      defaultValue={status}
      onChange={() => ref.current?.form?.requestSubmit()}
      className={`text-[11px] font-medium px-2 py-0.5 rounded border-0 cursor-pointer ${
        STATUS_COLOR[status] ?? 'bg-gray-100 text-gray-700'
      }`}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s.replace('_', ' ')}
        </option>
      ))}
    </select>
  )
}
