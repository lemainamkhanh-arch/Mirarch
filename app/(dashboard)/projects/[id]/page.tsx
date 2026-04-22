import { notFound } from "next/navigation"
import Link from "next/link"
import { getCurrentContext } from "@/lib/supabase/current-studio"
import { TabsNav } from "./tabs-nav"
import { OverviewTab } from "./tab-overview"
import { TasksTab } from "./tab-tasks"
import { SpecsTab } from "./tab-specs"
import { TimeTab } from "./tab-time"
import { DocumentsTab } from "./tab-documents"

export const dynamic = "force-dynamic"

const statusColor: Record<string, string> = {
  proposal: "bg-gray-100 text-gray-700",
  in_progress: "bg-blue-100 text-blue-700",
  feedback: "bg-amber-100 text-amber-800",
  on_hold: "bg-orange-100 text-orange-800",
  done: "bg-green-100 text-green-700",
  archived: "bg-gray-100 text-gray-500",
}

const statusLabel: Record<string, string> = {
  proposal: "Proposal",
  in_progress: "In Progress",
  feedback: "Feedback",
  on_hold: "On Hold",
  done: "Done",
  archived: "Archived",
}

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { id } = await params
  const sp = await searchParams
  const tab = sp.tab || "overview"
  const { supabase, studioId } = await getCurrentContext()

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("studio_id", studioId)
    .maybeSingle()

  if (!project) notFound()

  const [tasksRes, specsRes, entriesRes, clientRes] = await Promise.all([
    supabase
      .from("tasks")
      .select("*")
      .eq("project_id", id)
      .order("due_date", { ascending: true, nullsFirst: false }),
    supabase
      .from("specifications")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("time_entries")
      .select("*")
      .eq("project_id", id)
      .order("start_at", { ascending: false }),
    project.client_id
      ? supabase
          .from("contacts")
          .select("id,name,email,phone")
          .eq("id", project.client_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  const tasks = tasksRes.data || []
  const specs = specsRes.data || []
  const entries = entriesRes.data || []
  const client = clientRes.data as
    | { id: string; name: string; email?: string; phone?: string }
    | null

  const totalTasks = tasks.length
  const doneTasks = tasks.filter((t: { status: string }) => t.status === "done").length
  const progressPct = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100)

  const totalMinutes = entries.reduce(
    (s: number, e: { minutes: number | null }) => s + (e.minutes || 0),
    0,
  )
  const installedCount = specs.filter((s: { status: string }) => s.status === "installed").length

  const budgetFormatted = project.budget
    ? new Intl.NumberFormat("vi-VN").format(project.budget) +
      " " +
      (project.currency || "VND")
    : "—"

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-4 text-sm text-gray-500">
        <Link href="/projects" className="hover:text-gray-900">
          Projects
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{project.code}</span>
      </div>

      <div className="flex items-start justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-mono text-gray-500">{project.code}</span>
            <span
              className={
                "text-xs px-2 py-0.5 rounded-full " +
                (statusColor[project.status] || "bg-gray-100")
              }
            >
              {statusLabel[project.status] || project.status}
            </span>
            <span className="text-xs text-gray-500">{project.priority}</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">{project.name}</h1>
          {project.style && (
            <p className="text-sm text-gray-500 mt-1">{project.style}</p>
          )}
        </div>
        <div className="text-right text-sm">
          <div className="text-2xl font-semibold">{budgetFormatted}</div>
          <div className="text-gray-500">Budget</div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Progress"
          value={progressPct + "%"}
          hint={doneTasks + " / " + totalTasks + " tasks"}
        />
        <StatCard
          label="Timeline"
          value={project.start_date || "—"}
          hint={"→ " + (project.end_date || "—")}
        />
        <StatCard
          label="FF&E Items"
          value={String(specs.length)}
          hint={installedCount + " installed"}
        />
        <StatCard
          label="Logged Hours"
          value={(totalMinutes / 60).toFixed(1) + "h"}
          hint={entries.length + " entries"}
        />
      </div>

      <TabsNav projectId={id} active={tab} />

      <div className="mt-6">
        {tab === "overview" && (
          <OverviewTab
            project={project}
            client={client}
            progressPct={progressPct}
            totalTasks={totalTasks}
            doneTasks={doneTasks}
          />
        )}
        {tab === "tasks" && <TasksTab projectId={id} tasks={tasks} />}
        {tab === "furniture" && <SpecsTab projectId={id} specs={specs} />}
        {tab === "time" && <TimeTab projectId={id} entries={entries} />}
        {tab === "documents" && <DocumentsTab />}
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="border rounded-md p-4">
      <div className="text-xs text-gray-500 uppercase tracking-wider">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
      {hint && <div className="text-xs text-gray-500 mt-1">{hint}</div>}
    </div>
  )
}
