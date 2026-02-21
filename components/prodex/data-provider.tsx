"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { Task, Goal, Application, Skill, UserSettings } from "@/lib/store"
import {
  sampleTasks,
  sampleGoals,
  sampleApplications,
  sampleSkills,
  sampleSettings,
} from "@/lib/sample-data"

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
  settings: sampleSettings,
  setSettings: () => {},
})

export function useData() {
  return useContext(DataContext)
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(sampleTasks)
  const [goals, setGoals] = useState<Goal[]>(sampleGoals)
  const [applications, setApplications] = useState<Application[]>(sampleApplications)
  const [skills, setSkills] = useState<Skill[]>(sampleSkills)
  const [settings, setSettings] = useState<UserSettings>(sampleSettings)

  return (
    <DataContext.Provider
      value={{
        tasks, setTasks,
        goals, setGoals,
        applications, setApplications,
        skills, setSkills,
        settings, setSettings,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}
