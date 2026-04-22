import { updateProjectAction, deleteProjectAction } from "./actions"

type Project = {
  id: string
  name: string
  code: string
  status: string
  priority: string
  budget: number | null
  currency: string | null
  start_date: string | null
  end_date: string | null
  style: string | null
  client_id: string | null
}

type Client = { id: string; name: string; email?: string; phone?: string } | null

export function OverviewTab({
  project,
  client,
  progressPct,
  totalTasks,
  doneTasks,
}: {
  project: Project
  client: Client
  progressPct: number
  totalTasks: number
  doneTasks: number
}) {
  const updateAction = updateProjectAction.bind(null, project.id)
  const deleteAction = deleteProjectAction.bind(null, project.id)

  const fillStyle = { width: progressPct + "%" }

  const statusOptions: [string, string][] = [
    ["proposal", "Proposal"],
    ["in_progress", "In Progress"],
    ["feedback", "Feedback"],
    ["on_hold", "On Hold"],
    ["done", "Done"],
    ["archived", "Archived"],
  ]
  const priorityOptions: [string, string][] = [
    ["P1", "P1 — Critical"],
    ["P2", "P2 — High"],
    ["P3", "P3 — Medium"],
    ["P4", "P4 — Low"],
    ["P5", "P5 — Someday"],
  ]

  return (
    <div className="grid grid-cols-3 gap-8">
      <div className="col-span-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
          Project Details
        </h2>
        <form action={updateAction} className="space-y-4">
          <Field label="Name" name="name" defaultValue={project.name} />
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Status" name="status" defaultValue={project.status} options={statusOptions} />
            <SelectField label="Priority" name="priority" defaultValue={project.priority} options={priorityOptions} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Start Date" name="start_date" type="date" defaultValue={project.start_date || ""} />
            <Field label="End Date" name="end_date" type="date" defaultValue={project.end_date || ""} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Budget (VND)" name="budget" type="number" defaultValue={project.budget ? String(project.budget) : ""} />
            <Field label="Style" name="style" defaultValue={project.style || ""} placeholder="Japandi, Indochine, ..." />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800">
              Save Changes
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">Progress</h2>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-black" style={fillStyle} />
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {doneTasks} / {totalTasks} tasks complete
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">Client</h2>
          {client ? (
            <div className="border rounded-md p-3 text-sm">
              <div className="font-medium">{client.name}</div>
              {client.email && <div className="text-xs text-gray-500">{client.email}</div>}
              {client.phone && <div className="text-xs text-gray-500">{client.phone}</div>}
            </div>
          ) : (
            <div className="text-sm text-gray-500">No client linked</div>
          )}
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">Danger Zone</h2>
          <form action={deleteAction}>
            <button type="submit" className="text-xs text-red-600 hover:text-red-800 underline">
              Delete this project
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  placeholder,
}: {
  label: string
  name: string
  type?: string
  defaultValue?: string
  placeholder?: string
}) {
  return (
    <label className="block">
      <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
      />
    </label>
  )
}

function SelectField({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string
  name: string
  defaultValue: string
  options: [string, string][]
}) {
  return (
    <label className="block">
      <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
      >
        {options.map((o) => (
          <option key={o[0]} value={o[0]}>{o[1]}</option>
        ))}
      </select>
    </label>
  )
}
