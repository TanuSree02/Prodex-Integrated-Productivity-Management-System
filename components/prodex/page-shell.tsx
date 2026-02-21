"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  CheckSquare,
  BarChart3,
  Briefcase,
  Settings,
  Zap,
  Bell,
} from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/workload", label: "Workload", icon: BarChart3 },
  { href: "/career", label: "Career", icon: Briefcase },
  { href: "/settings", label: "Settings", icon: Settings },
]

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/tasks": "Tasks",
  "/workload": "Workload",
  "/career": "Career",
  "/settings": "Settings",
}

export function PageShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const pageTitle = pageTitles[pathname] || "Prodex"

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="flex w-60 shrink-0 flex-col bg-primary text-primary-foreground">
        <div className="flex items-center gap-2.5 px-6 py-6">
          <Zap className="h-6 w-6 text-accent" />
          <span className="text-lg font-bold text-primary-foreground">Prodex</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-white/15 text-primary-foreground"
                    : "text-primary-foreground/70 hover:bg-white/10 hover:text-primary-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6">
          <h1 className="text-xl font-semibold text-card-foreground">{pageTitle}</h1>
          <button className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors" aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </button>
        </header>
        <main className="flex-1 overflow-y-auto bg-background p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
