"use client"

import { useState, useMemo } from "react"
import { useData } from "@/components/prodex/data-provider"
import { MetricTile } from "@/components/prodex/metric-tile"
import { WorkloadBar } from "@/components/prodex/workload-bar"
import { PriorityBadge } from "@/components/prodex/priority-badge"
import { StatusChip } from "@/components/prodex/status-chip"
import { EmptyState } from "@/components/prodex/empty-state"
import { ChevronLeft, ChevronRight, Clock, Timer, Battery, TrendingUp } from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import type { Task } from "@/lib/store"

function getWeekRange(date: Date): { start: Date; end: Date } {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const start = new Date(d.setDate(diff))
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

function formatWeekLabel(start: Date, end: Date): string {
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }
  return `${start.toLocaleDateString("en-US", opts)} - ${end.toLocaleDateString("en-US", opts)}, ${end.getFullYear()}`
}

export default function WorkloadPage() {
  const { tasks, settings } = useData()
  const [currentDate, setCurrentDate] = useState(new Date())
  const { start, end } = getWeekRange(currentDate)

  const weekTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (!t.week) return false
      const taskWeek = new Date(t.week)
      const taskRange = getWeekRange(taskWeek)
      return taskRange.start.getTime() === start.getTime()
    })
  }, [tasks, start])

  const estimatedHours = weekTasks.reduce((sum, t) => sum + t.estimatedHours, 0)
  const actualHours = weekTasks.reduce((sum, t) => sum + t.actualHours, 0)
  const capacity = settings.weeklyCapacity

  const goToPrevWeek = () => {
    const d = new Date(currentDate)
    d.setDate(d.getDate() - 7)
    setCurrentDate(d)
  }

  const goToNextWeek = () => {
    const d = new Date(currentDate)
    d.setDate(d.getDate() + 7)
    setCurrentDate(d)
  }

  const goToThisWeek = () => {
    setCurrentDate(new Date())
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Week navigator */}
      <div className="flex items-center justify-between rounded-lg bg-card p-4 shadow-sm border border-border">
        <button
          onClick={goToPrevWeek}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted transition-colors"
          aria-label="Previous week"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-sm font-semibold text-card-foreground">{formatWeekLabel(start, end)}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={goToThisWeek}
            className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-card-foreground hover:bg-muted transition-colors"
          >
            This Week
          </button>
          <button
            onClick={goToNextWeek}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted transition-colors"
            aria-label="Next week"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricTile
          icon={<Clock className="h-5 w-5 text-accent" />}
          iconBg="bg-accent/10"
          value={estimatedHours || 0}
          label="Estimated Hours"
        />
        <MetricTile
          icon={<Timer className="h-5 w-5 text-[#2ECC71]" />}
          iconBg="bg-[#2ECC71]/10"
          value={actualHours || 0}
          label="Actual Hours"
        />
        <MetricTile
          icon={<Battery className="h-5 w-5 text-[#F39C12]" />}
          iconBg="bg-[#F39C12]/10"
          value={capacity}
          label="Capacity"
        />
      </div>

      {/* Capacity bar */}
      <div className="rounded-lg bg-card p-5 shadow-sm border border-border">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-card-foreground">Capacity Usage</span>
          <span className="text-muted-foreground">
            {estimatedHours} / {capacity}h
          </span>
        </div>
        <WorkloadBar used={estimatedHours} total={capacity} />
      </div>

      {/* 8-Week Workload Trend */}
      <div className="rounded-lg bg-card p-5 shadow-sm border border-border">
        <h2 className="mb-4 text-base font-semibold text-card-foreground">8-Week Workload Trend</h2>
        {tasks.length === 0 ? (
          <EmptyState
            icon={<TrendingUp className="h-10 w-10" />}
            title="No data yet"
            message="Assign tasks to weeks to see your workload trend."
          />
        ) : (
          <TrendChart tasks={tasks} startOfWeek={start} capacity={capacity} />
        )}
      </div>

      {/* Task breakdown table */}
      <div className="rounded-lg bg-card shadow-sm border border-border">
        <div className="p-5 pb-3">
          <h2 className="text-base font-semibold text-card-foreground">Task Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-t border-border">
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Task Title
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Priority
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Estimated Hours
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Actual Hours
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {weekTasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-sm text-muted-foreground">
                    No tasks assigned to this week
                  </td>
                </tr>
              ) : (
                weekTasks.map((task) => (
                  <tr key={task.id} className="border-t border-border">
                    <td className="px-5 py-3 text-sm font-medium text-card-foreground">
                      {task.title}
                    </td>
                    <td className="px-5 py-3">
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">
                      {task.estimatedHours}h
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">
                      {task.actualHours}h
                    </td>
                    <td className="px-5 py-3">
                      <StatusChip status={task.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function TrendChart({ tasks, startOfWeek, capacity }: { tasks: Task[]; startOfWeek: Date; capacity: number }) {
  const data = useMemo(() => {
    const weeks: { name: string; estimated: number; actual: number }[] = []
    for (let i = -4; i < 4; i++) {
      const weekStart = new Date(startOfWeek)
      weekStart.setDate(weekStart.getDate() + i * 7)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)

      const weekLabel = weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })

      const weekTasks = tasks.filter((t) => {
        if (!t.week) return false
        const taskWeekDate = new Date(t.week)
        return taskWeekDate >= weekStart && taskWeekDate <= weekEnd
      })

      weeks.push({
        name: weekLabel,
        estimated: weekTasks.reduce((sum, t) => sum + t.estimatedHours, 0),
        actual: weekTasks.reduce((sum, t) => sum + t.actualHours, 0),
      })
    }
    return weeks
  }, [tasks, startOfWeek])

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="estimatedGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4A90D9" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#4A90D9" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2ECC71" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#2ECC71" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} unit="h" />
        <Tooltip
          contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "13px" }}
          formatter={(value: number, name: string) => [`${value}h`, name === "estimated" ? "Estimated" : "Actual"]}
        />
        <ReferenceLine y={capacity} stroke="#E74C3C" strokeDasharray="4 4" label={{ value: "Capacity", position: "right", fill: "#E74C3C", fontSize: 12 }} />
        <Area type="monotone" dataKey="estimated" stroke="#4A90D9" fill="url(#estimatedGrad)" strokeWidth={2} />
        <Area type="monotone" dataKey="actual" stroke="#2ECC71" fill="url(#actualGrad)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
