import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentContext } from '@/lib/supabase/current-studio'
import { createProjectAction } from './actions'

export const dynamic = 'force-dynamic'

export default async function NewProjectPage() {
  const { user, studioId } = await getCurrentContext()
  if (!user) redirect('/login')
  if (!studioId) redirect('/onboarding')

  return (
    <div className="p-8 max-w-2xl">
      <Link href="/projects" className="text-sm text-gray-500 hover:text-gray-900 mb-4 inline-block">
        ← Về danh sách dự án
      </Link>
      <h1 className="text-3xl font-bold text-gray-900 mb-1">Dự án mới</h1>
      <p className="text-sm text-gray-500 mb-8">Tạo dự án mới trong studio của bạn.</p>

      <form action={createProjectAction} className="space-y-5 bg-white border border-gray-100 rounded-sm p-6">
        <div className="grid grid-cols-3 gap-3">
          <Field label="Mã dự án" name="code" placeholder="LV-13" required pattern="[A-Za-z0-9-]+" />
          <div className="col-span-2">
            <Field label="Tên dự án" name="name" placeholder="An Phu Villa" required />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Trạng thái</label>
            <select name="status" defaultValue="proposal" className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm">
              <option value="proposal">Proposal</option>
              <option value="in_progress">In progress</option>
              <option value="feedback">Feedback</option>
              <option value="on_hold">On hold</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Ưu tiên</label>
            <select name="priority" defaultValue="P2" className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm">
              <option value="P1">P1</option>
              <option value="P2">P2</option>
              <option value="P3">P3</option>
              <option value="P4">P4</option>
              <option value="P5">P5</option>
            </select>
          </div>
          <Field label="Phong cách" name="style" placeholder="Modern" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Ngân sách</label>
            <div className="flex">
              <input
                type="number"
                name="budget"
                step="1000000"
                placeholder="500000000"
                className="flex-1 border border-gray-200 rounded-l-sm px-3 py-2 text-sm focus:outline-none focus:border-gray-900"
              />
              <select name="currency" defaultValue="VND" className="border border-l-0 border-gray-200 rounded-r-sm px-2 py-2 text-sm bg-gray-50">
                <option value="VND">VND</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
          <Field label="Ngày bắt đầu" name="start_date" type="date" />
          <Field label="Ngày kết thúc" name="end_date" type="date" />
        </div>
        <button
          type="submit"
          className="bg-gray-900 text-white px-5 py-2 rounded-sm text-sm font-medium hover:bg-gray-800"
        >
          Tạo dự án
        </button>
      </form>
    </div>
  )
}

type FieldProps = {
  label: string
  name: string
  type?: string
  placeholder?: string
  required?: boolean
  pattern?: string
  step?: string
}

function Field({ label, name, type = 'text', placeholder, required, pattern, step }: FieldProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        pattern={pattern}
        step={step}
        className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-gray-900"
      />
    </div>
  )
}
