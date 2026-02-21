"use client"

import { useState } from "react"
import { useData } from "@/components/prodex/data-provider"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { User, Sliders, Lock, Eye, EyeOff, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const sections = [
  { key: "profile", label: "Profile", icon: User },
  { key: "preferences", label: "Preferences", icon: Sliders },
  { key: "password", label: "Password", icon: Lock },
]

export default function SettingsPage() {
  const { settings, setSettings } = useData()
  const [activeSection, setActiveSection] = useState("profile")

  // Profile local state — sync from context
  const [fullName, setFullName] = useState(settings.fullName || "Alex Morgan")
  const [email, setEmail] = useState(settings.email || "alex.morgan@prodex.io")
  const [timezone, setTimezone] = useState(settings.timezone || "EST")

  // Preferences local state
  const [weeklyCapacity, setWeeklyCapacity] = useState(settings.weeklyCapacity.toString())
  const [showOverload, setShowOverload] = useState(settings.showOverloadWarnings)
  const [enableReminders, setEnableReminders] = useState(settings.enableDeadlineReminders)

  // Password local state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)

  // Save state
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    if (activeSection === "profile") {
      setSettings((prev) => ({
        ...prev,
        fullName: fullName.trim(),
        email: email.trim(),
        timezone,
      }))
    } else if (activeSection === "preferences") {
      setSettings((prev) => ({
        ...prev,
        weeklyCapacity: parseInt(weeklyCapacity) || 40,
        showOverloadWarnings: showOverload,
        enableDeadlineReminders: enableReminders,
      }))
    }
    // Password section: just show saved
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex gap-6">
      {/* Left nav */}
      <nav className="w-48 shrink-0">
        <div className="flex flex-col gap-1">
          {sections.map((s) => (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-left",
                activeSection === s.key
                  ? "bg-accent/10 text-accent"
                  : "text-muted-foreground hover:bg-muted hover:text-card-foreground"
              )}
            >
              <s.icon className="h-4 w-4" />
              {s.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Right content */}
      <div className="flex-1 max-w-lg">
        <div className="rounded-lg bg-card p-6 shadow-sm border border-border">
          {activeSection === "profile" && (
            <div className="flex flex-col gap-5">
              <h2 className="text-base font-semibold text-card-foreground">Profile</h2>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-card-foreground">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your name"
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-card-foreground">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-card-foreground">Timezone</label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="IST">IST</SelectItem>
                    <SelectItem value="PST">PST</SelectItem>
                    <SelectItem value="EST">EST</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {activeSection === "preferences" && (
            <div className="flex flex-col gap-5">
              <h2 className="text-base font-semibold text-card-foreground">Preferences</h2>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-card-foreground">Weekly Capacity Hours</label>
                <input
                  type="number"
                  min="1"
                  max="168"
                  value={weeklyCapacity}
                  onChange={(e) => setWeeklyCapacity(e.target.value)}
                  className="h-9 w-32 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow]"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-card-foreground">Show overload warnings</label>
                <Switch checked={showOverload} onCheckedChange={setShowOverload} />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-card-foreground">Enable deadline reminders</label>
                <Switch checked={enableReminders} onCheckedChange={setEnableReminders} />
              </div>
            </div>
          )}

          {activeSection === "password" && (
            <div className="flex flex-col gap-5">
              <h2 className="text-base font-semibold text-card-foreground">Change Password</h2>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-card-foreground">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPw ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="h-9 w-full rounded-md border border-input bg-background px-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-card-foreground transition-colors"
                    aria-label={showCurrentPw ? "Hide password" : "Show password"}
                  >
                    {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-card-foreground">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPw ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="h-9 w-full rounded-md border border-input bg-background px-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-card-foreground transition-colors"
                    aria-label={showNewPw ? "Hide password" : "Show password"}
                  >
                    {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-card-foreground">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPw ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="h-9 w-full rounded-md border border-input bg-background px-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-card-foreground transition-colors"
                    aria-label={showConfirmPw ? "Hide password" : "Show password"}
                  >
                    {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={handleSave}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Save Changes
            </button>
            {saved && (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#2ECC71]">
                <Check className="h-4 w-4" />
                Saved!
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
