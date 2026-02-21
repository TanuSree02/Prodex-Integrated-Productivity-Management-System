"use client"

import type { ReactNode } from "react"

interface EmptyStateProps {
  icon: ReactNode
  title: string
  message: string
  action?: ReactNode
}

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="mb-4 text-muted-foreground/50">{icon}</div>
      <h3 className="text-base font-medium text-card-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
