import Link from "next/link"

const tabs: { key: string; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "tasks", label: "Tasks" },
  { key: "furniture", label: "Furniture" },
  { key: "time", label: "Time Tracking" },
  { key: "documents", label: "Documents" },
]

export function TabsNav({ projectId, active }: { projectId: string; active: string }) {
  return (
    <div className="flex gap-1 border-b">
      {tabs.map((t) => {
        const isActive = t.key === active
        const href = t.key === "overview" ? `/projects/${projectId}` : `/projects/${projectId}?tab=${t.key}`
        const cls = isActive
          ? "px-4 py-2 text-sm font-medium border-b-2 border-black -mb-px text-gray-900"
          : "px-4 py-2 text-sm text-gray-500 hover:text-gray-900"
        return (
          <Link key={t.key} href={href} className={cls}>{t.label}</Link>
        )
      })}
    </div>
  )
}
