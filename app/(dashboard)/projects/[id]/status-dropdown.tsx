"use client"

import { updateSpecStatusAction } from "./actions"

const statusOptions: [string, string][] = [
  ["specified", "Specified"],
  ["quoted", "Quoted"],
  ["client_approved", "Client Approved"],
  ["ordered", "Ordered"],
  ["in_transit", "In Transit"],
  ["delivered", "Delivered"],
  ["installed", "Installed"],
]

export function StatusDropdown({ specId, projectId, currentStatus }: { specId: string; projectId: string; currentStatus: string }) {
  const action = updateSpecStatusAction.bind(null, specId, projectId)
  return (
    <form action={action}>
      <select
        name="status"
        defaultValue={currentStatus}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="text-xs border border-gray-200 rounded px-2 py-1 bg-white"
      >
        {statusOptions.map((o) => (
          <option key={o[0]} value={o[0]}>{o[1]}</option>
        ))}
      </select>
    </form>
  )
}
