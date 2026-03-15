"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useData } from "@/components/prodex/data-provider"
import { GoalProgressBar } from "@/components/prodex/goal-progress-bar"
import { EmptyState } from "@/components/prodex/empty-state"
import { generateId, type Goal, type GoalCategory } from "@/lib/store"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Target,
  BookOpen,
  Plus,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  MoreHorizontal,
  Search,
  Code2,
  Database,
  Atom,
  Cloud,
  GitBranch,
  Braces,
  Cpu,
  Wrench,
  Sparkles,
} from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
const TOKEN_KEY = "prodex_token"

const goalCategories: { value: GoalCategory; label: string }[] = [
  { value: "technical", label: "Technical" },
  { value: "education", label: "Education" },
  { value: "leadership", label: "Leadership" },
  { value: "network", label: "Network" },
  { value: "other", label: "Other" },
]

const categoryColors: Record<string, string> = {
  technical: "bg-accent/15 text-accent",
  education: "bg-[#2ECC71]/15 text-[#2ECC71]",
  leadership: "bg-[#F39C12]/15 text-[#F39C12]",
  network: "bg-primary/15 text-primary",
  other: "bg-muted text-muted-foreground",
}

type SkillCatalogItem = {
  id: string
  name: string
  icon: string
  category: string
  custom?: boolean
}

function normalizeSkillKey(icon: string, name: string): string {
  const iconKey = (icon || "").toLowerCase().trim()
  if (iconKey) return iconKey
  const n = name.toLowerCase().trim()
  if (n.includes("python")) return "python"
  if (n.includes("react")) return "react"
  if (n.includes("next")) return "nextjs"
  if (n.includes("node")) return "nodejs"
  if (n.includes("postgre")) return "postgresql"
  if (n.includes("mongo")) return "mongodb"
  if (n.includes("docker")) return "docker"
  if (n.includes("java")) return "java"
  if (n.includes("git")) return "git"
  if (n.includes("aws")) return "aws"
  if (n.includes("sql")) return "sql"
  if (n.includes("c++")) return "cpp"
  if (n.includes("api")) return "api"
  return "other"
}

export default function CareerPage() {
  const { goals, setGoals } = useData()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("goals")

  const [goalModalOpen, setGoalModalOpen] = useState(false)
  const [goalTitle, setGoalTitle] = useState("")
  const [goalCategory, setGoalCategory] = useState<GoalCategory>("technical")
  const [goalTargetDate, setGoalTargetDate] = useState("")
  const [goalDescription, setGoalDescription] = useState("")
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null)
  const [editGoalTitle, setEditGoalTitle] = useState("")
  const [editGoalCategory, setEditGoalCategory] = useState<GoalCategory>("technical")
  const [editGoalTargetDate, setEditGoalTargetDate] = useState("")
  const [editGoalDescription, setEditGoalDescription] = useState("")

  const [skillQuery, setSkillQuery] = useState("")
  const [skillCatalog, setSkillCatalog] = useState<SkillCatalogItem[]>([])
  const [selectedSkillIds, setSelectedSkillIds] = useState<Set<string>>(new Set())
  const [skillsLoading, setSkillsLoading] = useState(false)
  const [skillsSaving, setSkillsSaving] = useState(false)
  const [skillsError, setSkillsError] = useState("")
  const [skillsNotice, setSkillsNotice] = useState("")
  const [otherModalOpen, setOtherModalOpen] = useState(false)
  const [customSkillInput, setCustomSkillInput] = useState("")

  const resetGoalForm = () => {
    setGoalTitle("")
    setGoalCategory("technical")
    setGoalTargetDate("")
    setGoalDescription("")
  }

  const handleCreateGoal = () => {
    if (!goalTitle.trim()) return
    const goal: Goal = {
      id: generateId(),
      title: goalTitle.trim(),
      category: goalCategory,
      targetDate: goalTargetDate,
      description: goalDescription.trim(),
      progress: 0,
      milestones: [],
      createdAt: new Date().toISOString(),
    }
    setGoals((prev) => [...prev, goal])
    resetGoalForm()
    setGoalModalOpen(false)
  }

  const handleGoalProgressChange = (goalId: string, newProgress: number) => {
    setGoals((prev) => prev.map((g) => (g.id === goalId ? { ...g, progress: newProgress } : g)))
  }

  const handleMilestoneToggle = (goalId: string, milestoneId: string) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g
        const updatedMilestones = g.milestones.map((m) =>
          m.id === milestoneId ? { ...m, done: !m.done } : m
        )
        const doneCount = updatedMilestones.filter((m) => m.done).length
        const newProgress = updatedMilestones.length > 0
          ? Math.round((doneCount / updatedMilestones.length) * 100)
          : g.progress
        return { ...g, milestones: updatedMilestones, progress: newProgress }
      })
    )
  }

  const handleDeleteGoal = (goalId: string) => {
    setGoals((prev) => prev.filter((goal) => goal.id !== goalId))
  }

  const openEditGoalModal = (goal: Goal) => {
    setEditingGoalId(goal.id)
    setEditGoalTitle(goal.title)
    setEditGoalCategory(goal.category)
    setEditGoalTargetDate(goal.targetDate || "")
    setEditGoalDescription(goal.description || "")
  }

  const handleSaveEditGoal = () => {
    if (!editingGoalId) return
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === editingGoalId
          ? {
              ...goal,
              title: editGoalTitle.trim() || goal.title,
              category: editGoalCategory,
              targetDate: editGoalTargetDate,
              description: editGoalDescription.trim(),
            }
          : goal
      )
    )
    setEditingGoalId(null)
  }

  const loadSkills = useCallback(async (query: string, hydrateSelected = false) => {
    setSkillsLoading(true)
    setSkillsError("")
    try {
      const token = localStorage.getItem(TOKEN_KEY)
      if (!token) {
        setSkillCatalog([])
        setSelectedSkillIds(new Set())
        setSkillsError("Please sign in to load your skills.")
        return
      }

      const params = new URLSearchParams()
      if (query.trim()) params.set("q", query.trim())

      const response = await fetch(`${API_BASE}/api/v1/skills/catalog?${params.toString()}`, {
        cache: "no-store",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        const details = await response.text()
        setSkillsError(details || "Unable to load skills right now.")
        setSkillCatalog([])
        return
      }

      const json = await response.json()
      const rows = (json?.data ?? []) as Array<SkillCatalogItem & { selected?: boolean }>
      setSkillCatalog(
        rows.map((row) => ({
          id: row.id,
          name: row.name,
          icon: row.icon || "",
          category: row.category || "",
          custom: !!row.custom || row.id.startsWith("custom:"),
        }))
      )

      if (hydrateSelected) {
        setSelectedSkillIds(new Set(rows.filter((row) => row.selected).map((row) => row.id)))
      }
    } catch (error) {
      console.warn("Skills catalog request failed", error)
      setSkillsError("Unable to load skills right now.")
    } finally {
      setSkillsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSkills("", true)
  }, [loadSkills])

  const filteredSkills = useMemo(() => {
    const term = skillQuery.trim().toLowerCase()
    if (!term) return skillCatalog
    return skillCatalog.filter((skill) => skill.name.toLowerCase().includes(term))
  }, [skillCatalog, skillQuery])

  const toggleSkill = (skillId: string) => {
    setSkillsNotice("")
    setSelectedSkillIds((prev) => {
      const next = new Set(prev)
      if (next.has(skillId)) {
        next.delete(skillId)
      } else {
        next.add(skillId)
      }
      return next
    })
  }

  const handleSaveCustomSkill = () => {
    const enteredName = customSkillInput.trim()
    if (!enteredName) return

    const existingSkill = skillCatalog.find(
      (skill) => skill.name.toLowerCase() === enteredName.toLowerCase()
    )

    if (existingSkill) {
      setSelectedSkillIds((prev) => new Set(prev).add(existingSkill.id))
      setOtherModalOpen(false)
      setCustomSkillInput("")
      setSkillsNotice(`Selected existing skill: ${existingSkill.name}`)
      return
    }

    const customId = `custom:${enteredName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
    const alreadySelectedCustom = skillCatalog.some(
      (skill) =>
        (skill.custom || skill.id.startsWith("custom:")) &&
        skill.name.toLowerCase() === enteredName.toLowerCase()
    )

    if (alreadySelectedCustom) {
      setSkillsNotice("That custom skill already exists.")
      return
    }

    setSkillCatalog((prev) => [
      ...prev,
      {
        id: customId,
        name: enteredName,
        icon: "other",
        category: "custom",
        custom: true,
      },
    ])
    setSelectedSkillIds((prev) => new Set(prev).add(customId))
    setOtherModalOpen(false)
    setCustomSkillInput("")
    setSkillsNotice("Custom skill added.")
  }

  const saveSkillsSelection = async () => {
    setSkillsSaving(true)
    setSkillsError("")
    setSkillsNotice("")

    try {
      const token = localStorage.getItem(TOKEN_KEY)
      if (!token) {
        setSkillsError("Please sign in to save your skills.")
        return false
      }

      const selectedRows = skillCatalog.filter((skill) => selectedSkillIds.has(skill.id))
      const response = await fetch(`${API_BASE}/api/v1/skills/selection`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          skillIds: selectedRows
            .filter((skill) => !skill.custom && !skill.id.startsWith("custom:"))
            .map((skill) => skill.id),
          customSkills: selectedRows
            .filter((skill) => skill.custom || skill.id.startsWith("custom:"))
            .map((skill) => skill.name),
        }),
      })

      if (!response.ok) {
        const details = await response.text()
        setSkillsError(details || "Unable to save selected skills.")
        return false
      }

      setSkillsNotice("Skills saved successfully.")
      return true
    } catch (error) {
      console.warn("Save selected skills failed", error)
      setSkillsError("Unable to save selected skills.")
      return false
    } finally {
      setSkillsSaving(false)
    }
  }

  const handleContinue = async () => {
    const ok = await saveSkillsSelection()
    if (ok) {
      router.push("/dashboard")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
        </TabsList>

        <TabsContent value="goals">
          <div className="flex items-center justify-between mb-4 mt-4">
            <h2 className="text-base font-semibold text-card-foreground">Career Goals</h2>
            <button
              onClick={() => setGoalModalOpen(true)}
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Goal
            </button>
          </div>
          {goals.length === 0 ? (
            <div className="rounded-lg bg-card p-5 shadow-sm border border-border">
              <EmptyState
                icon={<Target className="h-10 w-10" />}
                title="No goals yet"
                message="Add your first career goal to start tracking progress."
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onProgressChange={(p) => handleGoalProgressChange(goal.id, p)}
                  onMilestoneToggle={(mId) => handleMilestoneToggle(goal.id, mId)}
                  onEdit={() => openEditGoalModal(goal)}
                  onDelete={() => handleDeleteGoal(goal.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="skills">
          <section className="prodex-surface p-5 mt-4">
            <div className="mb-5 flex flex-col gap-1">
              <h2 className="text-base font-semibold text-card-foreground">Skills Selection</h2>
              <p className="text-sm text-muted-foreground">
                Pick multiple skills you want to track. Selected skills are highlighted and saved for your account.
              </p>
            </div>

            <div className="relative mb-4 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={skillQuery}
                onChange={(e) => setSkillQuery(e.target.value)}
                placeholder="Search skills..."
                className="prodex-input h-10 w-full pl-9"
              />
            </div>

            {skillsError && (
              <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {skillsError}
              </div>
            )}
            {skillsNotice && (
              <div className="mb-4 rounded-md border border-[#2ECC71]/30 bg-[#2ECC71]/10 px-3 py-2 text-sm text-[#2ECC71]">
                {skillsNotice}
              </div>
            )}

            {skillsLoading ? (
              <div className="rounded-lg border border-border bg-background/70 p-8 text-center text-sm text-muted-foreground">
                Loading skills...
              </div>
            ) : filteredSkills.length === 0 ? (
              <div className="rounded-lg border border-border bg-background/70 p-8 text-center text-sm text-muted-foreground">
                No skills found for your search.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {filteredSkills.map((skill) => {
                  const selected = selectedSkillIds.has(skill.id)
                  return (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => toggleSkill(skill.id)}
                      className={`group rounded-xl border p-3 text-left transition-all duration-200 ${
                        selected
                          ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary/25"
                          : "border-border bg-muted/30 hover:border-muted-foreground/40 hover:bg-muted/60"
                      }`}
                    >
                      <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-md bg-background/80">
                        <SkillIcon icon={skill.icon} name={skill.name} selected={selected} />
                      </div>
                      <p className={`text-sm font-medium ${selected ? "text-primary" : "text-card-foreground"}`}>
                        {skill.name}
                      </p>
                      <p className="mt-0.5 text-[11px] capitalize text-muted-foreground">{skill.category || "general"}</p>
                    </button>
                  )
                })}
                <button
                  type="button"
                  onClick={() => setOtherModalOpen(true)}
                  className="group rounded-xl border border-dashed border-muted-foreground/40 bg-muted/20 p-3 text-left transition-all duration-200 hover:border-primary/50 hover:bg-primary/5"
                >
                  <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-md bg-background/80">
                    <Sparkles className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-sm font-medium text-card-foreground">Other</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">Add custom skill</p>
                </button>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setActiveTab("goals")}
                className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-card-foreground hover:bg-muted transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleContinue}
                disabled={skillsSaving}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:cursor-not-allowed disabled:opacity-70"
              >
                {skillsSaving ? "Saving..." : "Continue / Save"}
              </button>
            </div>
          </section>
        </TabsContent>
      </Tabs>

      <Dialog open={goalModalOpen} onOpenChange={setGoalModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Goal</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-card-foreground">Goal Title</label>
              <input
                type="text"
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                placeholder="e.g., Learn TypeScript"
                className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-card-foreground">Category</label>
              <Select value={goalCategory} onValueChange={(v) => setGoalCategory(v as GoalCategory)}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {goalCategories.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-card-foreground">Target Date</label>
              <input
                type="date"
                value={goalTargetDate}
                onChange={(e) => setGoalTargetDate(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-card-foreground">Description</label>
              <textarea
                value={goalDescription}
                onChange={(e) => setGoalDescription(e.target.value)}
                placeholder="Describe your goal..."
                rows={3}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow] resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => { resetGoalForm(); setGoalModalOpen(false) }}
              className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-card-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateGoal}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Save Goal
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={otherModalOpen} onOpenChange={setOtherModalOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Custom Skill</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-card-foreground">Skill Name</label>
            <input
              type="text"
              value={customSkillInput}
              onChange={(e) => setCustomSkillInput(e.target.value)}
              placeholder="e.g., PyTorch Lightning"
              className="prodex-input h-9"
            />
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={() => {
                setOtherModalOpen(false)
                setCustomSkillInput("")
              }}
              className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-card-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveCustomSkill}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Save
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingGoalId} onOpenChange={(open) => { if (!open) setEditingGoalId(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-card-foreground">Goal Title</label>
              <input
                type="text"
                value={editGoalTitle}
                onChange={(e) => setEditGoalTitle(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-card-foreground">Category</label>
              <Select value={editGoalCategory} onValueChange={(v) => setEditGoalCategory(v as GoalCategory)}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {goalCategories.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-card-foreground">Target Date</label>
              <input
                type="date"
                value={editGoalTargetDate}
                onChange={(e) => setEditGoalTargetDate(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-card-foreground">Description</label>
              <textarea
                value={editGoalDescription}
                onChange={(e) => setEditGoalDescription(e.target.value)}
                rows={3}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow] resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setEditingGoalId(null)}
              className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-card-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEditGoal}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Save Changes
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function GoalCard({
  goal,
  onProgressChange,
  onMilestoneToggle,
  onEdit,
  onDelete,
}: {
  goal: Goal
  onProgressChange: (p: number) => void
  onMilestoneToggle: (mId: string) => void
  onEdit: () => void
  onDelete: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-lg bg-card p-5 shadow-sm border border-border">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-medium text-card-foreground pr-2">{goal.title}</h3>
        <div className="flex items-center gap-1.5">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColors[goal.category] || categoryColors.other}`}>
            {goal.category.charAt(0).toUpperCase() + goal.category.slice(1)}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-card-foreground"
                aria-label="Goal actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={onDelete}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {goal.description && (
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{goal.description}</p>
      )}

      <div className="mb-1">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-card-foreground">Progress</span>
          <span className="text-xs font-semibold text-accent">{goal.progress}%</span>
        </div>
        <GoalProgressBar percent={goal.progress} />
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={goal.progress}
          onChange={(e) => onProgressChange(parseInt(e.target.value, 10))}
          className="w-full h-1.5 mt-2 accent-accent cursor-pointer"
          aria-label={`Set progress for ${goal.title}`}
        />
      </div>

      {goal.milestones.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-card-foreground transition-colors"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {goal.milestones.filter((m) => m.done).length} of {goal.milestones.length} milestones
          </button>
          {expanded && (
            <div className="mt-2 flex flex-col gap-1.5 pl-1">
              {goal.milestones.map((m) => (
                <button
                  key={m.id}
                  onClick={() => onMilestoneToggle(m.id)}
                  className="flex items-center gap-2 text-left group/ms"
                >
                  {m.done ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#2ECC71]" />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0 text-muted-foreground/40 group-hover/ms:text-accent transition-colors" />
                  )}
                  <span className={`text-xs ${m.done ? "text-muted-foreground line-through" : "text-card-foreground"}`}>
                    {m.title}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        {goal.milestones.length === 0 && (
          <span>Drag slider to update progress</span>
        )}
        {goal.targetDate && (
          <span className="ml-auto">Target: {new Date(goal.targetDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
        )}
      </div>
    </div>
  )
}

function SkillIcon({ icon, name, selected }: { icon: string; name: string; selected: boolean }) {
  const key = normalizeSkillKey(icon, name)
  const muted = "#94a3b8"
  const active = {
    python: "#3776AB",
    sql: "#2563eb",
    react: "#61DAFB",
    nextjs: "#ffffff",
    nodejs: "#339933",
    aws: "#FF9900",
    docker: "#2496ED",
    git: "#F05032",
    java: "#EA4335",
    mongodb: "#47A248",
    postgresql: "#336791",
    cpp: "#00599C",
    api: "#0EA5E9",
    other: "#A78BFA",
  } as const
  const color = selected ? (active[key as keyof typeof active] || "#60A5FA") : muted

  if (key === "python") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <rect x="3" y="3" width="10" height="9" rx="3" fill={selected ? "#3776AB" : muted} />
        <rect x="11" y="12" width="10" height="9" rx="3" fill={selected ? "#FFD43B" : muted} />
        <circle cx="8.2" cy="6.9" r="1" fill="#fff" />
        <circle cx="15.8" cy="17.1" r="1" fill="#fff" />
      </svg>
    )
  }

  if (key === "docker") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <rect x="4" y="10" width="3" height="3" rx="0.6" fill={color} />
        <rect x="7.5" y="10" width="3" height="3" rx="0.6" fill={color} />
        <rect x="11" y="10" width="3" height="3" rx="0.6" fill={color} />
        <rect x="7.5" y="6.5" width="3" height="3" rx="0.6" fill={color} />
        <rect x="11" y="6.5" width="3" height="3" rx="0.6" fill={color} />
        <path d="M3 14.5h13.8c-.8 2.8-2.8 4-5.8 4H8.2c-2.1 0-4-1.2-5.2-4Z" fill={color} />
      </svg>
    )
  }

  if (key === "aws") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <text x="3" y="12.5" fontSize="8.2" fontWeight="700" fill={color}>aws</text>
        <path d="M4 16c3.5 2.5 9.6 2.6 14.7.3" stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      </svg>
    )
  }

  if (key === "nextjs") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <circle cx="12" cy="12" r="9" fill={selected ? "#fff" : muted} />
        <path d="M8 16V8l8 8V8" stroke={selected ? "#000" : "#0f172a"} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (key === "nodejs") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path d="M12 2.8 19.2 7v10L12 21.2 4.8 17V7Z" fill={color} />
        <text x="9.1" y="15" fontSize="6.5" fontWeight="700" fill="#fff">N</text>
      </svg>
    )
  }

  if (key === "cpp") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <rect x="2.8" y="4" width="18.5" height="16" rx="3" fill={selected ? "#00599C" : muted} />
        <text x="6.4" y="14.1" fontSize="6.3" fontWeight="700" fill="#fff">C++</text>
      </svg>
    )
  }

  if (key === "mongodb") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path d="M12 3c2.4 3.1 4.1 6.2 4.1 9.4A4.1 4.1 0 1 1 7.9 12.4C7.9 9.2 9.6 6.1 12 3Z" fill={color} />
        <path d="M12 6v11" stroke="#fff" strokeWidth="1" />
      </svg>
    )
  }

  if (key === "postgresql") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <ellipse cx="12" cy="7.5" rx="5.7" ry="3.2" fill={color} />
        <path d="M6.3 7.5v7.5c0 1.8 2.5 3.2 5.7 3.2s5.7-1.4 5.7-3.2V7.5" fill={color} />
        <path d="M8.5 11.6c1.3-.7 5.8-.7 7 0" stroke="#fff" strokeWidth="1" />
      </svg>
    )
  }

  if (key === "react") {
    return <Atom className="h-5 w-5" style={{ color }} aria-hidden="true" />
  }
  if (key === "git") {
    return <GitBranch className="h-5 w-5" style={{ color }} aria-hidden="true" />
  }
  if (key === "sql") {
    return <Database className="h-5 w-5" style={{ color }} aria-hidden="true" />
  }
  if (key === "api") {
    return <Braces className="h-5 w-5" style={{ color }} aria-hidden="true" />
  }
  if (key === "java") {
    return <Wrench className="h-5 w-5" style={{ color }} aria-hidden="true" />
  }
  if (key === "other") {
    return <Sparkles className="h-5 w-5" style={{ color }} aria-hidden="true" />
  }
  if (key === "cloud") {
    return <Cloud className="h-5 w-5" style={{ color }} aria-hidden="true" />
  }

  const fallback = name.toLowerCase().includes("data") || name.toLowerCase().includes("sql")
    ? Database
    : name.toLowerCase().includes("api") || name.toLowerCase().includes("code")
      ? Code2
      : Cpu
  const FallbackIcon = fallback
  return <FallbackIcon className="h-5 w-5" style={{ color }} aria-hidden="true" />
}
