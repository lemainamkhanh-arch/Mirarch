import Image from "next/image"
import { updateProjectAction, deleteProjectAction, uploadCoverAction } from "./actions"

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
  cover_url?: string | null
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
  const coverAction = uploadCoverAction.bind(null, project.id)

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
      <div className="col-span-2 space-y-8">
        {/* Cover image */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Ảnh bìa
          </h2>
          {project.cover_url ? (
            <div className="relative rounded-md overflow-hidden aspect-[16/6] bg-gray-100 mb-3">
              <Image
                src={project.cover_url}
                alt="Project cover"
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="aspect-[16/6] bg-gray-50 border-2 border-dashed border-gray-200 rounded-md flex items-center justify-center mb-3">
              <span className="text-sm text-gray-400">Ảnh bìa chưa được tải lên</span>
            </div>
          )}
          <form action={coverAction} encType="multipart/form-data" className="flex items-center gap-3">
            <input
              type="file"
              name="cover"
              accept="image/jpeg,image/png,image/webp"
              required
              className="text-xs text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-sm file:border-0 file:text-xs file:font-medium file:bg-gray-900 file:text-white hover:file:bg-gray-800 cursor-pointer"
            />
            <button
              type="submit"
              className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-sm hover:bg-gray-200 shrink-0"
            >
              Tải lên
            </button>
          </form>
        </div>

        {/* Project details form */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
            Thông tin dự án
          </h2>
          <form action={updateAction} className="space-y-4">
            <Field label="Tên dự án" name="name" defaultValue={project.name} />
            <div className="grid grid-cols-2 gap-4">
              <SelectField
                label="Trạng thái"
                name="status"
                defaultValue={project.status}
                options={statusOptions}
              />
              <SelectField
                label="Ưu tiên"
                name="priority"
                defaultValue={project.priority}
                options={priorityOptions}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Ngày bắt đầu"
                name="start_date"
                type="date"
                defaultValue={project.start_date || ""}
              />
              <Field
                label="Ngày kết thúc"
                name="end_date"
                type="date"
                defaultValue={project.end_date || ""}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Ngân sách (VND)"
                name="budget"
                type="number"
                defaultValue={project.budget ? String(project.budget) : ""}
              />
              <Field
                label="Phong cách"
                name="style"
                defaultValue={project.style || ""}
                placeholder="Japandi, Indochine, ..."
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800"
              >
                Lưu thay đổi
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Tiến độ
          </h2>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-black" style={fillStyle} />
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {doneTasks} / {totalTasks} tasks hoàn thành
          </div>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Khách hàng
          </h2>
          {client ? (
            <div className="border rounded-md p-3 text-sm">
              <div className="font-medium">{client.name}</div>
              {client.email && (
                <div className="text-xs text-gray-500">{client.email}</div>
              )}
              {client.phone && (
                <div className="text-xs text-gray-500">{client.phone}</div>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-500">Chưa liên kết khách hàng</div>
          )}
        </div>

        {project.start_date && project.end_date && (
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
              Timeline
            </h2>
            <div className="text-sm">
              <div className="flex justify-between text-gray-600 mb-1">
                <span>Đầu</span>
                <span>
                  {new Date(project.start_date).toLocaleDateString("vi-VN")}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Cuối</span>
                <span>
                  {new Date(project.end_date).toLocaleDateString("vi-VN")}
                </span>
              </div>
              {(() => {
                const daysLeft = Math.ceil(
                  (new Date(project.end_date).getTime() - Date.now()) /
                    86400000,
                )
                return daysLeft < 0 ? (
                  <div className="text-xs text-red-500 mt-2">
                    ⚠️ Quá hạn {Math.abs(daysLeft)} ngày
                  </div>
                ) : daysLeft <= 14 ? (
                  <div className="text-xs text-orange-500 mt-2">
                    ⏰ Còn {daysLeft} ngày
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 mt-2">
                    Còn {daysLeft} ngày
                  </div>
                )
              })()}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Danger Zone
          </h2>
          <form action={deleteAction}>
            <button
              type="submit"
              className="text-xs text-red-600 hover:text-red-800 underline"
            >
              Xóa dự án này
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
      <span className="text-xs text-gray-500 uppercase tracking-wider">
        {label}
      </span>
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
      <span className="text-xs text-gray-500 uppercase tracking-wider">
        {label}
      </span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
      >
        {options.map((o) => (
          <option key={o[0]} value={o[0]}>
            {o[1]}
          </option>
        ))}
      </select>
    </label>
  )
}
