"use client"

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import type { Task, Goal, Application, Skill, UserSettings } from "@/lib/store"

interface DataContextType {
  tasks: Task[]
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>
  goals: Goal[]
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>
  applications: Application[]
  setApplications: React.Dispatch<React.SetStateAction<Application[]>>
  skills: Skill[]
  setSkills: React.Dispatch<React.SetStateAction<Skill[]>>
  settings: UserSettings
  setSettings: React.Dispatch<React.SetStateAction<UserSettings>>
  isLoading: boolean
}

const defaultSettings: UserSettings = {
  fullName: "",
  email: "",
  timezone: "UTC",
  weeklyCapacity: 40,
  showOverloadWarnings: true,
  enableDeadlineReminders: true,
}

const DataContext = createContext<DataContextType>({
  tasks: [],
  setTasks: () => {},
  goals: [],
  setGoals: () => {},
  applications: [],
  setApplications: () => {},
  skills: [],
  setSkills: () => {},
  settings: defaultSettings,
  setSettings: () => {},
  isLoading: true,
})

export function useData() {
  return useContext(DataContext)
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
const HIDDEN_KEYS = {
  tasks: "prodex_hidden_tasks",
  goals: "prodex_hidden_goals",
  applications: "prodex_hidden_applications",
  skills: "prodex_hidden_skills",
} as const

async function extractErrorDetails(response: Response): Promise<string> {
  const raw = await response.text()
  if (!raw) return ""
  try {
    const parsed = JSON.parse(raw)
    return parsed?.details || parsed?.error || raw
  } catch {
    return raw
  }
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [tasksState, setTasksState] = useState<Task[]>([])
  const [goalsState, setGoalsState] = useState<Goal[]>([])
  const [applicationsState, setApplicationsState] = useState<Application[]>([])
  const [skillsState, setSkillsState] = useState<Skill[]>([])
  const [settingsState, setSettingsState] = useState<UserSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)

  const hydratedRef = useRef(false)
  const suppressNextSyncRef = useRef(false)
  const suppressNextTaskSyncRef = useRef(false)
  const isSyncingRef = useRef(false)
  const localDirtyRef = useRef(false)
  const hiddenTaskIdsRef = useRef<Set<string>>(new Set())
  const hiddenGoalIdsRef = useRef<Set<string>>(new Set())
  const hiddenApplicationIdsRef = useRef<Set<string>>(new Set())
  const hiddenSkillIdsRef = useRef<Set<string>>(new Set())

  const hydrateHiddenIds = () => {
    try {
      hiddenTaskIdsRef.current = new Set(JSON.parse(localStorage.getItem(HIDDEN_KEYS.tasks) || "[]"))
      hiddenGoalIdsRef.current = new Set(JSON.parse(localStorage.getItem(HIDDEN_KEYS.goals) || "[]"))
      hiddenApplicationIdsRef.current = new Set(JSON.parse(localStorage.getItem(HIDDEN_KEYS.applications) || "[]"))
      hiddenSkillIdsRef.current = new Set(JSON.parse(localStorage.getItem(HIDDEN_KEYS.skills) || "[]"))
    } catch {
      hiddenTaskIdsRef.current = new Set()
      hiddenGoalIdsRef.current = new Set()
      hiddenApplicationIdsRef.current = new Set()
      hiddenSkillIdsRef.current = new Set()
    }
  }

  const persistHiddenIds = () => {
    localStorage.setItem(HIDDEN_KEYS.tasks, JSON.stringify(Array.from(hiddenTaskIdsRef.current)))
    localStorage.setItem(HIDDEN_KEYS.goals, JSON.stringify(Array.from(hiddenGoalIdsRef.current)))
    localStorage.setItem(HIDDEN_KEYS.applications, JSON.stringify(Array.from(hiddenApplicationIdsRef.current)))
    localStorage.setItem(HIDDEN_KEYS.skills, JSON.stringify(Array.from(hiddenSkillIdsRef.current)))
  }

  const applyData = (payload: {
    tasks: Task[]
    goals: Goal[]
    applications: Application[]
    skills: Skill[]
    settings: UserSettings
  }) => {
    suppressNextSyncRef.current = true
    localDirtyRef.current = false
    setTasksState((payload.tasks ?? []).filter((item) => !hiddenTaskIdsRef.current.has(item.id)))
    setGoalsState((payload.goals ?? []).filter((item) => !hiddenGoalIdsRef.current.has(item.id)))
    setApplicationsState((payload.applications ?? []).filter((item) => !hiddenApplicationIdsRef.current.has(item.id)))
    setSkillsState((payload.skills ?? []).filter((item) => !hiddenSkillIdsRef.current.has(item.id)))
    setSettingsState(payload.settings ?? defaultSettings)
    hydratedRef.current = true
  }

  const applyNonTaskData = (payload: {
    goals: Goal[]
    applications: Application[]
    skills: Skill[]
    settings: UserSettings
  }) => {
    suppressNextSyncRef.current = true
    setGoalsState((payload.goals ?? []).filter((item) => !hiddenGoalIdsRef.current.has(item.id)))
    setApplicationsState((payload.applications ?? []).filter((item) => !hiddenApplicationIdsRef.current.has(item.id)))
    setSkillsState((payload.skills ?? []).filter((item) => !hiddenSkillIdsRef.current.has(item.id)))
    setSettingsState(payload.settings ?? defaultSettings)
    hydratedRef.current = true
  }

  const fetchFromServer = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/data`, { cache: "no-store" })
      if (!response.ok) {
        const details = await extractErrorDetails(response)
        console.warn(`Failed to load data (${response.status}): ${details}`)
        return
      }
      const json = await response.json()
      applyData(json.data)
    } catch (error) {
      console.warn("Failed to load data", error)
    }
  }

  useEffect(() => {
    let cancelled = false

    const init = async () => {
      try {
        hydrateHiddenIds()
        await fetchFromServer()
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    init()

    const interval = setInterval(() => {
      if (isSyncingRef.current || localDirtyRef.current) return
      fetchFromServer()
    }, 5000)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  const taskSyncPayload = useMemo(() => ({ tasks: tasksState }), [tasksState])

  const syncPayload = useMemo(
    () => ({ goals: goalsState, applications: applicationsState, skills: skillsState, settings: settingsState }),
    [goalsState, applicationsState, skillsState, settingsState]
  )

  useEffect(() => {
    if (!hydratedRef.current) return
    if (suppressNextTaskSyncRef.current) {
      suppressNextTaskSyncRef.current = false
      return
    }

    let cancelled = false

    const syncNow = async () => {
      isSyncingRef.current = true
      try {
        let response = await fetch(`${API_BASE}/api/v1/tasks/sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskSyncPayload),
        })
        if (!response.ok) {
          // Fallback to full sync endpoint to keep task persistence working
          response = await fetch(`${API_BASE}/api/v1/sync`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tasks: taskSyncPayload.tasks,
              goals: goalsState,
              applications: applicationsState,
              skills: skillsState,
              settings: settingsState,
            }),
          })
        }
        if (!response.ok) {
          const details = await extractErrorDetails(response)
          console.warn(`Sync failed (${response.status}): ${details}`)
          return
        }
        await response.json()
        if (!cancelled) {
          localDirtyRef.current = false
        }
      } catch (error) {
        console.error(error)
      } finally {
        isSyncingRef.current = false
      }
    }

    syncNow()

    return () => {
      cancelled = true
    }
  }, [taskSyncPayload, goalsState, applicationsState, skillsState, settingsState])

  useEffect(() => {
    if (!hydratedRef.current) return
    if (suppressNextSyncRef.current) {
      suppressNextSyncRef.current = false
      return
    }

    let cancelled = false

    const syncNow = async () => {
      isSyncingRef.current = true
      try {
        const response = await fetch(`${API_BASE}/api/v1/sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...syncPayload, tasks: [] }),
        })
        if (!response.ok) {
          const details = await extractErrorDetails(response)
          console.warn(`Sync failed (${response.status}): ${details}`)
          return
        }
        const json = await response.json()
        if (!cancelled && json?.data) {
          applyNonTaskData(json.data)
        } else {
          localDirtyRef.current = false
        }
      } catch (error) {
        console.error(error)
      } finally {
        isSyncingRef.current = false
      }
    }

    syncNow()

    return () => {
      cancelled = true
    }
  }, [syncPayload])

  return (
    <DataContext.Provider
      value={{
        tasks: tasksState,
        setTasks: (value) => {
          localDirtyRef.current = true
          setTasksState((prev) => {
            const next = typeof value === "function" ? value(prev) : value
            const nextIds = new Set(next.map((item) => item.id))
            prev.forEach((item) => {
              if (!nextIds.has(item.id)) hiddenTaskIdsRef.current.add(item.id)
            })
            next.forEach((item) => hiddenTaskIdsRef.current.delete(item.id))
            persistHiddenIds()
            return next
          })
        },
        goals: goalsState,
        setGoals: (value) => {
          localDirtyRef.current = true
          setGoalsState((prev) => {
            const next = typeof value === "function" ? value(prev) : value
            const nextIds = new Set(next.map((item) => item.id))
            prev.forEach((item) => {
              if (!nextIds.has(item.id)) hiddenGoalIdsRef.current.add(item.id)
            })
            next.forEach((item) => hiddenGoalIdsRef.current.delete(item.id))
            persistHiddenIds()
            return next
          })
        },
        applications: applicationsState,
        setApplications: (value) => {
          localDirtyRef.current = true
          setApplicationsState((prev) => {
            const next = typeof value === "function" ? value(prev) : value
            const nextIds = new Set(next.map((item) => item.id))
            prev.forEach((item) => {
              if (!nextIds.has(item.id)) hiddenApplicationIdsRef.current.add(item.id)
            })
            next.forEach((item) => hiddenApplicationIdsRef.current.delete(item.id))
            persistHiddenIds()
            return next
          })
        },
        skills: skillsState,
        setSkills: (value) => {
          localDirtyRef.current = true
          setSkillsState((prev) => {
            const next = typeof value === "function" ? value(prev) : value
            const nextIds = new Set(next.map((item) => item.id))
            prev.forEach((item) => {
              if (!nextIds.has(item.id)) hiddenSkillIdsRef.current.add(item.id)
            })
            next.forEach((item) => hiddenSkillIdsRef.current.delete(item.id))
            persistHiddenIds()
            return next
          })
        },
        settings: settingsState,
        setSettings: (value) => {
          localDirtyRef.current = true
          setSettingsState(value)
        },
        isLoading,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}
