"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface MetricTileProps {
  icon: ReactNode
  value: number | string
  label: string
  iconBg?: string
}

export function MetricTile({ icon, value, label, iconBg = "bg-accent/10" }: MetricTileProps) {
  const isEmpty = value === 0 || value === "0" || value === "0%"
  return (
    <div className="flex items-center gap-4 rounded-lg bg-card p-5 shadow-sm border border-border">
      <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-lg", iconBg)}>
        {icon}
      </div>
      <div>
        <p className={cn("text-2xl font-bold leading-tight", isEmpty ? "text-muted-foreground" : "text-card-foreground")}>
          {value}
        </p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}
