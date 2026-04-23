import Link from "next/link"
import { NewModuleDialog } from "./new-module-dialog"

type Mod = {
  id: string
  name: string
  kind: "document" | "schedule"
}

export function TabsNav({
  projectId,
  active,
  modules,
}: {
  projectId: string
  active: string
  modules: Mod[]
}) {
  return (
    <div className="flex gap-1 border-b overflow-x-auto items-center">
      <TabLink
        href={`/projects/${projectId}`}
        label="Overview"
        active={active === "overview"}
      />
      {modules.map((m) => (
        <TabLink
          key={m.id}
          href={`/projects/${projectId}?module=${m.id}`}
          label={m.name || "Untitled"}
          active={active === m.id}
        />
      ))}
      <div className="ml-2">
        <NewModuleDialog projectId={projectId} compact />
      </div>
    </div>
  )
}

function TabLink({
  href,
  label,
  active,
}: {
  href: string
  label: string
  active: boolean
}) {
  const cls = active
    ? "px-4 py-2 text-xs font-medium border-b-2 border-black -mb-px text-gray-900 uppercase tracking-wider whitespace-nowrap"
    : "px-4 py-2 text-xs text-gray-500 hover:text-gray-900 uppercase tracking-wider whitespace-nowrap"
  return (
    <Link href={href} className={cls}>
      {label}
    </Link>
  )
}
