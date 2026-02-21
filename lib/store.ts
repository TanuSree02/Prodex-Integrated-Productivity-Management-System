// Prodex data types and client-side store
export type Priority = "critical" | "high" | "medium" | "low"
export type TaskStatus = "todo" | "in-progress" | "done" | "archived"
export type ApplicationStatus = "saved" | "applied" | "phone-screen" | "interview" | "offer" | "rejected" | "withdrawn"
export type GoalCategory = "technical" | "education" | "leadership" | "network" | "other"

export interface Task {
  id: string
  title: string
  description: string
  priority: Priority
  status: TaskStatus
  estimatedHours: number
  actualHours: number
  deadline: string
  week: string
  createdAt: string
}

export interface Goal {
  id: string
  title: string
  category: GoalCategory
  targetDate: string
  description: string
  progress: number
  milestones: { id: string; title: string; done: boolean }[]
  createdAt: string
}

export interface Application {
  id: string
  company: string
  role: string
  status: ApplicationStatus
  dateApplied: string
  jobUrl: string
  notes: string
  createdAt: string
}

export interface Skill {
  id: string
  name: string
  category: string
  rating: number
  assessedAt: string
}

export interface UserSettings {
  fullName: string
  email: string
  timezone: string
  weeklyCapacity: number
  showOverloadWarnings: boolean
  enableDeadlineReminders: boolean
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36)
}
