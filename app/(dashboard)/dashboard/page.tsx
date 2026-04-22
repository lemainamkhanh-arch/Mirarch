import { redirect } from "next/navigation"
import Link from "next/link"
import {
  Briefcase,
  Clock,
  AlertTriangle,
  TrendingUp,
  CalendarClock,
} from "lucide-react"
import { getCurrentContext } from "@/lib/supabase/current-studio"
import { PortfolioHealth } from "@/components/dashboard/portfolio-health"

export const dynamic = "force-dynamic"

const STATUS_COLOR: Record<string, string> = {
  not_started: "bg-gray-100 text-gray-600",
  in_progress: "bg-blue-100 text-blue-700",
  blocked: "bg-red-100 text-red-700",
  done: "bg-green-100 text-green-700",
  archived: "bg-gray-100 text-gray-400",
}

export default async function DashboardPage() {
  const { supabase, user, studioId } = await getCurrentContext()
  if (!user) redirect("/login")
  if (!studioId) redirect("/onboarding")

  const { data: projects } = await supabase
    .from("projects")
    .select("id, code, name, status, budget, currency, end_date")
    .eq("studio_id", studioId)

  const rows = projects ?? []
  const countBy = (s: string) => rows.filter((p) => p.status === s).length
  const active = rows.filter((p) =>
    ["proposal", "in_progress", "feedback"].includes(p.status as string),
  ).length

  // Total budget in VND
  const totalBudgetVND = rows.reduce(
    (s, p) => s + Number(p.budget ?? 0),
    0,
  )

  const projectIds = rows.map((p) => p.id)

  const [{ count: openTasks }, tasksRes, recentTimeRes] = await Promise.all([
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .in(
        "project_id",
        projectIds.length
          ? projectIds
          : ["00000000-0000-0000-0000-000000000000"],
      )
      .in("status", ["not_started", "in_progress", "blocked"]),
    // tasks due soon (next 7 days)
    supabase
      .from("tasks")
      .select("id, title, status, due_date, project_id")
      .in(
        "project_id",
        projectIds.length
          ? projectIds
          : ["00000000-0000-0000-0000-000000000000"],
      )
      .in("status", ["not_started", "in_progress"])
      .lte("due_date", new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10))
      .order("due_date", { ascending: true })
      .limit(5),
    supabase
      .from("time_entries")
      .select("id, project_id, minutes, start_at, note")
      .in(
        "project_id",
        projectIds.length
          ? projectIds
          : ["00000000-0000-0000-0000-000000000000"],
      )
      .order("start_at", { ascending: false })
      .limit(5),
  ])

  const projectMap = new Map(rows.map((p) => [p.id, p]))

  const pie = [
    { name: "Proposal", value: countBy("proposal") },
    { name: "In progress", value: countBy("in_progress") },
    { name: "Feedback", value: countBy("feedback") },
    { name: "On hold", value: countBy("on_hold") },
    { name: "Done", value: countBy("done") },
  ]

  const metadata = (user.user_metadata ?? {}) as { full_name?: string }
  const fullName = metadata.full_name ?? user.email ?? "Architect"

  // Projects ending within 30 days
  const endingSoon = rows
    .filter((p) => {
      if (!p.end_date) return false
      const d = new Date(p.end_date as string)
      return d >= new Date() && d <= new Date(Date.now() + 30 * 86400000)
    })
    .sort(
      (a, b) =>
        new Date(a.end_date as string).getTime() -
        new Date(b.end_date as string).getTime(),
    )
    .slice(0, 3)

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">
        Xin chào, {fullName.split(" ").pop()} 👋
      </h1>
      <p className="text-sm text-gray-500 mb-8">
        Tổng quan hoạt động studio hôm nay.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Kpi
          label="Dự án đang chạy"
          value={active.toString()}
          icon={Briefcase}
          href="/projects"
        />
        <Kpi
          label="Task còn lại"
          value={(openTasks ?? 0).toString()}
          icon={Clock}
          href="/todo"
        />
        <Kpi
          label="Tổng ngân sách"
          value={
            totalBudgetVND
              ? new Intl.NumberFormat("vi-VN", {
                  notation: "compact",
                  maximumFractionDigits: 1,
                }).format(totalBudgetVND) + " VND"
              : "—"
          }
          icon={TrendingUp}
          href="/projects"
        />
        <Kpi
          label="Cần phản hồi"
          value={countBy("feedback").toString()}
          icon={AlertTriangle}
          href="/projects"
          warn={countBy("feedback") > 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Tasks due soon */}
          <div className="bg-white border border-gray-100 rounded-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900">
                <CalendarClock className="w-4 h-4 inline mr-1.5 text-gray-500" />
                Task sắp đến hạn
              </h2>
              <Link
                href="/todo?filter=open"
                className="text-xs text-gray-500 hover:text-gray-900"
              >
                Xem tất cả →
              </Link>
            </div>
            {tasksRes.data && tasksRes.data.length > 0 ? (
              <ul className="divide-y divide-gray-50">
                {tasksRes.data.map((t) => {
                  const p = projectMap.get(t.project_id as string)
                  const isOverdue =
                    t.due_date && new Date(t.due_date as string) < new Date()
                  return (
                    <li
                      key={t.id}
                      className="flex items-center justify-between py-2 text-sm"
                    >
                      <div>
                        <span
                          className={
                            isOverdue ? "text-red-600 font-medium" : "text-gray-900"
                          }
                        >
                          {t.title}
                        </span>
                        {p && (
                          <span className="ml-2 text-[11px] text-gray-400 font-mono">
                            {p.code}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                            STATUS_COLOR[t.status as string] ?? "bg-gray-100"
                          }`}
                        >
                          {(t.status as string).replace("_", " ")}
                        </span>
                        <span
                          className={`text-xs ${
                            isOverdue ? "text-red-600 font-medium" : "text-gray-500"
                          }`}
                        >
                          {t.due_date}
                        </span>
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="text-sm text-gray-400 py-4 text-center">
                Không có task đến hạn sắp.
              </p>
            )}
          </div>

          {/* Recent time logs */}
          <div className="bg-white border border-gray-100 rounded-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900">
                <Clock className="w-4 h-4 inline mr-1.5 text-gray-500" />
                Giờ gần nhất
              </h2>
              <Link
                href="/time-tracking"
                className="text-xs text-gray-500 hover:text-gray-900"
              >
                Xem tất cả →
              </Link>
            </div>
            {recentTimeRes.data && recentTimeRes.data.length > 0 ? (
              <ul className="divide-y divide-gray-50">
                {recentTimeRes.data.map((e) => {
                  const p = projectMap.get(e.project_id as string)
                  return (
                    <li
                      key={e.id}
                      className="flex items-center justify-between py-2 text-sm"
                    >
                      <div>
                        <span className="text-gray-900">
                          {(e.note as string) || "Time log"}
                        </span>
                        {p && (
                          <span className="ml-2 text-[11px] text-gray-400 font-mono">
                            {p.code}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-gray-700">
                        {(Number(e.minutes) / 60).toFixed(1)}h
                      </span>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="text-sm text-gray-400 py-4 text-center">
                Chưa có giờ nào được log.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <PortfolioHealth data={pie} total={active} />

          {/* Projects ending soon */}
          {endingSoon.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-sm p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">
                ⏰ Kết thúc sắp tới
              </h2>
              <ul className="space-y-2">
                {endingSoon.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/projects/${p.id}`}
                      className="flex items-center justify-between text-xs hover:text-gray-900"
                    >
                      <span className="font-mono text-gray-500 mr-2">
                        {p.code}
                      </span>
                      <span className="text-gray-700 flex-1 truncate">{p.name}</span>
                      <span className="text-gray-500 ml-2">{p.end_date}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Kpi({
  label,
  value,
  icon: Icon,
  href,
  warn,
}: {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  warn?: boolean
}) {
  return (
    <Link href={href} className="block bg-white border border-gray-100 rounded-sm p-5 hover:border-gray-300 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          {label}
        </span>
        <Icon
          className={`w-4 h-4 ${
            warn ? "text-amber-500" : "text-gray-400"
          }`}
        />
      </div>
      <p
        className={`text-2xl font-bold ${
          warn ? "text-amber-600" : "text-gray-900"
        }`}
      >
        {value}
      </p>
    </Link>
  )
}
