"use client"

import { cn } from "@/lib/utils"
import type { Priority } from "@/lib/store"

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  critical: { label: "Critical", className: "bg-[#E74C3C] text-white" },
  high: { label: "High", className: "bg-[#F39C12] text-white" },
  medium: { label: "Medium", className: "bg-[#F1C40F] text-[#1a1a2e]" },
  low: { label: "Low", className: "bg-[#2ECC71] text-white" },
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const config = priorityConfig[priority]
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", config.className)}>
      {config.label}
    </span>
  )
}
