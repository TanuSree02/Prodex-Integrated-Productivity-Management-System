"use client"

import { useState } from "react"
import { useData } from "@/components/prodex/data-provider"
import { GoalProgressBar } from "@/components/prodex/goal-progress-bar"
import { EmptyState } from "@/components/prodex/empty-state"
import { generateId, type Goal, type GoalCategory, type Skill } from "@/lib/store"
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
import { Target, BookOpen, Plus, Star, ChevronDown, ChevronUp, CheckCircle2, Circle } from "lucide-react"

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

export default function CareerPage() {
  const { goals, setGoals, skills, setSkills } = useData()

  // Goal modal
  const [goalModalOpen, setGoalModalOpen] = useState(false)
  const [goalTitle, setGoalTitle] = useState("")
  const [goalCategory, setGoalCategory] = useState<GoalCategory>("technical")
  const [goalTargetDate, setGoalTargetDate] = useState("")
  const [goalDescription, setGoalDescription] = useState("")

  // Skill modal
  const [skillModalOpen, setSkillModalOpen] = useState(false)
  const [skillName, setSkillName] = useState("")
  const [skillCategory, setSkillCategory] = useState("technical")
  const [skillRating, setSkillRating] = useState(3)

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

  const resetSkillForm = () => {
    setSkillName("")
    setSkillCategory("technical")
    setSkillRating(3)
  }

  const handleCreateSkill = () => {
    if (!skillName.trim()) return
    const skill: Skill = {
      id: generateId(),
      name: skillName.trim(),
      category: skillCategory,
      rating: skillRating,
      assessedAt: new Date().toISOString(),
    }
    setSkills((prev) => [...prev, skill])
    resetSkillForm()
    setSkillModalOpen(false)
  }

  // Goal progress change handler
  const handleGoalProgressChange = (goalId: string, newProgress: number) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, progress: newProgress } : g))
    )
  }

  // Goal milestone toggle handler
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

  return (
    <div className="flex flex-col gap-6">
      <Tabs defaultValue="goals">
        <TabsList>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
        </TabsList>

        {/* Goals Tab */}
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
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills">
          <div className="flex items-center justify-between mb-4 mt-4">
            <h2 className="text-base font-semibold text-card-foreground">Skills</h2>
            <button
              onClick={() => setSkillModalOpen(true)}
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Skill
            </button>
          </div>
          {skills.length === 0 ? (
            <div className="rounded-lg bg-card p-5 shadow-sm border border-border">
              <EmptyState
                icon={<BookOpen className="h-10 w-10" />}
                title="No skills added yet"
                message="Add a skill to start tracking your growth."
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {skills.map((skill) => (
                <SkillCard key={skill.id} skill={skill} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Goal Modal */}
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

      {/* Skill Modal */}
      <Dialog open={skillModalOpen} onOpenChange={setSkillModalOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Skill</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-card-foreground">Skill Name</label>
              <input
                type="text"
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
                placeholder="e.g., React"
                className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-card-foreground">Category</label>
              <Select value={skillCategory} onValueChange={setSkillCategory}>
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
              <label className="text-sm font-medium text-card-foreground">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setSkillRating(star)}
                    className="p-0.5 transition-colors"
                    aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= skillRating
                          ? "fill-[#F39C12] text-[#F39C12]"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => { resetSkillForm(); setSkillModalOpen(false) }}
              className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-card-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateSkill}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Save Skill
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* ──────────────── Goal Card ──────────────── */

function GoalCard({
  goal,
  onProgressChange,
  onMilestoneToggle,
}: {
  goal: Goal
  onProgressChange: (p: number) => void
  onMilestoneToggle: (mId: string) => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-lg bg-card p-5 shadow-sm border border-border">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-medium text-card-foreground">{goal.title}</h3>
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColors[goal.category] || categoryColors.other}`}>
          {goal.category.charAt(0).toUpperCase() + goal.category.slice(1)}
        </span>
      </div>

      {goal.description && (
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{goal.description}</p>
      )}

      {/* Progress slider */}
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
          onChange={(e) => onProgressChange(parseInt(e.target.value))}
          className="w-full h-1.5 mt-2 accent-accent cursor-pointer"
          aria-label={`Set progress for ${goal.title}`}
        />
      </div>

      {/* Milestones (expandable) */}
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

      {/* Target date */}
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

/* ──────────────── Skill Card ──────────────── */

function SkillCard({ skill }: { skill: Skill }) {
  return (
    <div className="rounded-lg bg-card p-5 shadow-sm border border-border">
      <h3 className="text-sm font-medium text-card-foreground mb-2">{skill.name}</h3>
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium mb-3 ${categoryColors[skill.category] || categoryColors.other}`}>
        {skill.category.charAt(0).toUpperCase() + skill.category.slice(1)}
      </span>
      <div className="flex gap-0.5 mt-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= skill.rating ? "fill-[#F39C12] text-[#F39C12]" : "text-muted-foreground/30"
            }`}
          />
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Assessed: {new Date(skill.assessedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </p>
    </div>
  )
}
