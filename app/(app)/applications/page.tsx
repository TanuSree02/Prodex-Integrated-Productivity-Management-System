"use client"

import { useState } from "react"
import { useData } from "@/components/prodex/data-provider"
import { EmptyState } from "@/components/prodex/empty-state"
import { generateId, type Application, type ApplicationStatus } from "@/lib/store"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Briefcase, Plus } from "lucide-react"

const applicationStatuses: { value: ApplicationStatus; label: string }[] = [
  { value: "saved", label: "Saved" },
  { value: "applied", label: "Applied" },
  { value: "phone-screen", label: "Phone Screen" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
  { value: "withdrawn", label: "Withdrawn" },
]

const appStatusColors: Record<string, string> = {
  saved: "#6b7280",
  applied: "#4A90D9",
  "phone-screen": "#F39C12",
  interview: "#4A90D9",
  offer: "#2ECC71",
  rejected: "#E74C3C",
  withdrawn: "#6b7280",
}

export default function ApplicationsPage() {
  const { applications, setApplications } = useData()
  const [modalOpen, setModalOpen] = useState(false)
  const [appCompany, setAppCompany] = useState("")
  const [appRole, setAppRole] = useState("")
  const [appStatus, setAppStatus] = useState<ApplicationStatus>("saved")
  const [appDate, setAppDate] = useState("")
  const [appUrl, setAppUrl] = useState("")
  const [appNotes, setAppNotes] = useState("")

  const resetAppForm = () => {
    setAppCompany("")
    setAppRole("")
    setAppStatus("saved")
    setAppDate("")
    setAppUrl("")
    setAppNotes("")
  }

  const handleCreateApp = () => {
    if (!appCompany.trim()) return
    const app: Application = {
      id: generateId(),
      company: appCompany.trim(),
      role: appRole.trim(),
      status: appStatus,
      dateApplied: appDate,
      jobUrl: appUrl.trim(),
      notes: appNotes.trim(),
      createdAt: new Date().toISOString(),
    }
    setApplications((prev) => [...prev, app])
    resetAppForm()
    setModalOpen(false)
  }

  const handleAppStatusChange = (appId: string, newStatus: ApplicationStatus) => {
    setApplications((prev) => prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a)))
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-card-foreground">Job Applications</h2>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Application
        </button>
      </div>

      {applications.length === 0 ? (
        <div className="rounded-lg bg-card p-5 shadow-sm border border-border">
          <EmptyState
            icon={<Briefcase className="h-10 w-10" />}
            title="No applications yet"
            message="Start tracking your job search."
          />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="hidden sm:grid sm:grid-cols-[1fr_1fr_160px_120px] gap-4 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <span>Company</span>
            <span>Role</span>
            <span>Status</span>
            <span>Date Applied</span>
          </div>
          {applications.map((app) => (
            <ApplicationRow
              key={app.id}
              app={app}
              onStatusChange={(s) => handleAppStatusChange(app.id, s)}
            />
          ))}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Application</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-card-foreground">Company Name</label>
              <input
                type="text"
                value={appCompany}
                onChange={(e) => setAppCompany(e.target.value)}
                placeholder="e.g., Vercel"
                className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-card-foreground">Role Title</label>
              <input
                type="text"
                value={appRole}
                onChange={(e) => setAppRole(e.target.value)}
                placeholder="e.g., Frontend Engineer"
                className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-card-foreground">Status</label>
                <Select value={appStatus} onValueChange={(v) => setAppStatus(v as ApplicationStatus)}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {applicationStatuses.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-card-foreground">Date Applied</label>
                <input
                  type="date"
                  value={appDate}
                  onChange={(e) => setAppDate(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow]"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-card-foreground">Job URL</label>
              <input
                type="url"
                value={appUrl}
                onChange={(e) => setAppUrl(e.target.value)}
                placeholder="https://..."
                className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-card-foreground">Notes</label>
              <textarea
                value={appNotes}
                onChange={(e) => setAppNotes(e.target.value)}
                placeholder="Any notes about this application..."
                rows={3}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow] resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => { resetAppForm(); setModalOpen(false) }}
              className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-card-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateApp}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Save Application
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ApplicationRow({
  app,
  onStatusChange,
}: {
  app: Application
  onStatusChange: (s: ApplicationStatus) => void
}) {
  const color = appStatusColors[app.status] || "#6b7280"
  return (
    <div className="rounded-lg bg-card border border-border shadow-sm p-4 sm:grid sm:grid-cols-[1fr_1fr_160px_120px] sm:items-center gap-4">
      <div>
        <p className="text-sm font-medium text-card-foreground">{app.company}</p>
        {app.notes && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{app.notes}</p>
        )}
      </div>
      <p className="text-sm text-muted-foreground mt-1 sm:mt-0">{app.role}</p>
      <div className="mt-2 sm:mt-0">
        <Select value={app.status} onValueChange={(v) => onStatusChange(v as ApplicationStatus)}>
          <SelectTrigger
            className="h-8 w-[148px] text-xs font-medium border-0"
            style={{ backgroundColor: `${color}15`, color }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {applicationStatuses.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <p className="text-xs text-muted-foreground mt-2 sm:mt-0">
        {app.dateApplied
          ? new Date(app.dateApplied).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          : "--"}
      </p>
    </div>
  )
}
