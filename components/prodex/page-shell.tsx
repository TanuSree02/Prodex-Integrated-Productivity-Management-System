"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/prodex/auth-provider"
import { useTheme } from "next-themes"
import {
  LayoutDashboard,
  CheckSquare,
  BarChart3,
  Briefcase,
  GraduationCap,
  LifeBuoy,
  Menu,
  X,
  Settings,
  Zap,
  Bell,
  LogOut,
  Moon,
  Sun,
} from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/workload", label: "Workload", icon: BarChart3 },
  { href: "/applications", label: "Applications", icon: Briefcase },
  { href: "/career", label: "Career", icon: Briefcase },
  { href: "/resources", label: "Resources", icon: GraduationCap },
  { href: "/support", label: "Support", icon: LifeBuoy },
  { href: "/settings", label: "Settings", icon: Settings },
]

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/tasks": "Tasks",
  "/workload": "Workload",
  "/applications": "Applications",
  "/career": "Career",
  "/resources": "Resources",
  "/support": "Support",
  "/settings": "Settings",
}

export function PageShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const pageTitle = pageTitles[pathname] || (pathname.startsWith("/resources/") ? "Resources" : "Prodex")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-30 bg-black/30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Slide-in sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar text-sidebar-foreground shadow-2xl transition-transform duration-200",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center gap-2.5 border-b border-sidebar-border px-6 py-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-accent">
            <Zap className="h-5 w-5 text-accent" />
          </div>
          <div>
            <p className="text-lg font-bold text-sidebar-foreground">Prodex</p>
            <p className="text-xs text-sidebar-foreground/70">Productivity OS</p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-out will-change-transform hover:scale-[1.03] active:scale-[0.98]",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-foreground shadow-sm"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-sidebar-border px-4 py-3 text-xs text-sidebar-foreground/65">
          Stay focused. Track progress daily.
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-border/80 bg-card/95 px-4 backdrop-blur md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-card-foreground">{pageTitle}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors"
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={logout}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#1F3E69] bg-[#1F3E69] px-3 text-sm font-medium text-white hover:bg-[#183355] transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-background px-4 py-5 md:px-6 md:py-6">
          {children}
        </main>
      </div>
    </div>
  )
}
