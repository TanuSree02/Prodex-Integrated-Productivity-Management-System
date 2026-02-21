"use client"

import { cn } from "@/lib/utils"

const statusStyles: Record<string, string> = {
  todo: "bg-muted text-muted-foreground",
  "in-progress": "bg-accent/15 text-accent",
  done: "bg-success/15 text-[#2ECC71]",
  archived: "bg-muted text-muted-foreground",
  saved: "bg-muted text-muted-foreground",
  applied: "bg-accent/15 text-accent",
  "phone-screen": "bg-[#F39C12]/15 text-[#F39C12]",
  interview: "bg-accent/15 text-accent",
  offer: "bg-success/15 text-[#2ECC71]",
  rejected: "bg-destructive/15 text-destructive",
  withdrawn: "bg-muted text-muted-foreground",
}

const statusLabels: Record<string, string> = {
  todo: "To Do",
  "in-progress": "In Progress",
  done: "Done",
  archived: "Archived",
  saved: "Saved",
  applied: "Applied",
  "phone-screen": "Phone Screen",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
}

export function StatusChip({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", statusStyles[status] || "bg-muted text-muted-foreground")}>
      {statusLabels[status] || status}
    </span>
  )
}
