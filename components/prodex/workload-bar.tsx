"use client"

import { cn } from "@/lib/utils"

interface WorkloadBarProps {
  used: number
  total: number
}

export function WorkloadBar({ used, total }: WorkloadBarProps) {
  if (total === 0 && used === 0) {
    return (
      <div className="h-4 w-full rounded-full bg-muted" />
    )
  }
  const pct = total > 0 ? Math.min((used / total) * 100, 100) : 0
  const color = pct >= 100 ? "bg-destructive" : pct >= 80 ? "bg-warning" : "bg-success"
  return (
    <div className="h-4 w-full rounded-full bg-muted">
      <div
        className={cn("h-full rounded-full transition-all", color)}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
