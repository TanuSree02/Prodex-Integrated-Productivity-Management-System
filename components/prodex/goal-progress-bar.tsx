"use client"

interface GoalProgressBarProps {
  percent: number
}

export function GoalProgressBar({ percent }: GoalProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percent))
  return (
    <div className="flex items-center gap-3">
      <div className="h-2.5 flex-1 rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-accent transition-all"
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className="text-sm font-medium text-muted-foreground">{clamped}%</span>
    </div>
  )
}
