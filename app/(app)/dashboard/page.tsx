"use client"

import { useMemo } from "react"
import { useData } from "@/components/prodex/data-provider"
import { MetricTile } from "@/components/prodex/metric-tile"
import { EmptyState } from "@/components/prodex/empty-state"
import {
  CalendarDays,
  Gauge,
  Target,
  FileText,
  TrendingUp,
  BarChart3,
  CheckSquare,
  Briefcase,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

const PRIORITY_COLORS: Record<string, string> = {
  critical: "#E74C3C",
  high: "#F39C12",
  medium: "#4A90D9",
  low: "#2ECC71",
}

export default function DashboardPage() {
  const { tasks, goals, applications, settings } = useData()

  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay() + 1)
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)

  const tasksDueThisWeek = tasks.filter((t) => {
    if (!t.deadline) return false
    const d = new Date(t.deadline)
    return d >= startOfWeek && d <= endOfWeek && t.status !== "done" && t.status !== "archived"
  }).length

  const totalEstimated = tasks
    .filter((t) => t.status !== "done" && t.status !== "archived")
    .reduce((sum, t) => sum + t.estimatedHours, 0)
  const workloadPct = settings.weeklyCapacity > 0
    ? Math.round((totalEstimated / settings.weeklyCapacity) * 100)
    : 0

  const activeGoals = goals.filter((g) => g.progress < 100).length
  const openApplications = applications.filter(
    (a) => a.status !== "rejected" && a.status !== "withdrawn"
  ).length

  // 8-week workload trend data
  const workloadTrendData = useMemo(() => {
    const weeks: { name: string; hours: number }[] = []
    for (let i = -4; i < 4; i++) {
      const weekStart = new Date(startOfWeek)
      weekStart.setDate(weekStart.getDate() + i * 7)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)

      const weekLabel = weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })

      const weekHours = tasks
        .filter((t) => {
          if (!t.week) return false
          const taskWeekDate = new Date(t.week)
          return taskWeekDate >= weekStart && taskWeekDate <= weekEnd
        })
        .reduce((sum, t) => sum + t.estimatedHours, 0)

      weeks.push({ name: weekLabel, hours: weekHours })
    }
    return weeks
  }, [tasks, startOfWeek])

  // Priority breakdown data
  const priorityData = useMemo(() => {
    const counts: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 }
    tasks.forEach((t) => {
      if (t.status !== "archived") counts[t.priority]++
    })
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([key, value]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value,
        color: PRIORITY_COLORS[key],
      }))
  }, [tasks])

  const recentTasks = tasks.slice(-5).reverse()
  const recentApplications = applications.slice(-5).reverse()

  return (
    <div className="flex flex-col gap-6">
      {/* Metric tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile
          icon={<CalendarDays className="h-5 w-5 text-accent" />}
          iconBg="bg-accent/10"
          value={tasksDueThisWeek}
          label="Tasks Due This Week"
        />
        <MetricTile
          icon={<Gauge className="h-5 w-5 text-[#2ECC71]" />}
          iconBg="bg-[#2ECC71]/10"
          value={`${workloadPct}%`}
          label="Workload Used"
        />
        <MetricTile
          icon={<Target className="h-5 w-5 text-[#F39C12]" />}
          iconBg="bg-[#F39C12]/10"
          value={activeGoals}
          label="Active Goals"
        />
        <MetricTile
          icon={<FileText className="h-5 w-5 text-primary" />}
          iconBg="bg-primary/10"
          value={openApplications}
          label="Open Applications"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg bg-card p-5 shadow-sm border border-border">
          <h2 className="mb-4 text-base font-semibold text-card-foreground">Workload Trend</h2>
          {tasks.length === 0 ? (
            <EmptyState
              icon={<TrendingUp className="h-10 w-10" />}
              title="No data yet"
              message="Start tracking workload to see trends here."
            />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={workloadTrendData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} unit="h" />
                <Tooltip
                  contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "13px" }}
                  formatter={(value: number) => [`${value}h`, "Hours"]}
                />
                <Bar dataKey="hours" fill="#4A90D9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="rounded-lg bg-card p-5 shadow-sm border border-border">
          <h2 className="mb-4 text-base font-semibold text-card-foreground">Tasks by Priority</h2>
          {priorityData.length === 0 ? (
            <EmptyState
              icon={<BarChart3 className="h-10 w-10" />}
              title="No data yet"
              message="Create tasks to see your priority breakdown."
            />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "13px" }}
                  formatter={(value: number, name: string) => [value, name]}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: "13px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Feed panels */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg bg-card p-5 shadow-sm border border-border">
          <h2 className="mb-4 text-base font-semibold text-card-foreground">Recent Tasks</h2>
          {recentTasks.length === 0 ? (
            <EmptyState
              icon={<CheckSquare className="h-10 w-10" />}
              title="No tasks yet"
              message="Create your first task to get started."
            />
          ) : (
            <div className="flex flex-col gap-3">
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-card-foreground">{task.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">{task.priority} priority</p>
                  </div>
                  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize"
                    style={{
                      backgroundColor: task.status === "done" ? "#2ECC7120" : task.status === "in-progress" ? "#4A90D920" : "#F0F2F5",
                      color: task.status === "done" ? "#2ECC71" : task.status === "in-progress" ? "#4A90D9" : "#6b7280",
                    }}
                  >
                    {task.status.replace("-", " ")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-lg bg-card p-5 shadow-sm border border-border">
          <h2 className="mb-4 text-base font-semibold text-card-foreground">Career Activity</h2>
          {recentApplications.length === 0 && goals.length === 0 ? (
            <EmptyState
              icon={<Briefcase className="h-10 w-10" />}
              title="No activity yet"
              message="Start by adding a goal or job application."
            />
          ) : (
            <div className="flex flex-col gap-3">
              {recentApplications.map((app) => {
                const statusColor =
                  app.status === "offer" ? "#2ECC71" :
                  app.status === "interview" || app.status === "phone-screen" ? "#4A90D9" :
                  app.status === "rejected" ? "#E74C3C" :
                  "#6b7280"
                return (
                  <div
                    key={app.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-card-foreground">{app.company}</p>
                      <p className="text-xs text-muted-foreground">{app.role}</p>
                    </div>
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize"
                      style={{
                        backgroundColor: `${statusColor}20`,
                        color: statusColor,
                      }}
                    >
                      {app.status.replace("-", " ")}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
