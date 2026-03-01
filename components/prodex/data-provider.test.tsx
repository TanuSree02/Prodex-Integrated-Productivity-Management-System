import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { DataProvider, useData } from "@/components/prodex/data-provider"
import type { Task } from "@/lib/store"

function DataConsumer() {
  const { tasks, setTasks, settings } = useData()

  return (
    <div>
      <p data-testid="task-count">{tasks.length}</p>
      <p data-testid="weekly-capacity">{settings.weeklyCapacity}</p>
      <button
        onClick={() => {
          const newTask: Task = {
            id: "new-task-id",
            title: "Test task",
            description: "",
            priority: "low",
            status: "todo",
            estimatedHours: 1,
            actualHours: 0,
            deadline: "",
            week: "",
            createdAt: new Date().toISOString(),
          }
          setTasks((prev) => [...prev, newTask])
        }}
      >
        Add task
      </button>
    </div>
  )
}

describe("DataProvider", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        if (typeof input === "string" && input.includes("/api/v1/data")) {
          return {
            ok: true,
            json: async () => ({
              data: {
                tasks: [
                  {
                    id: "t1",
                    title: "Task from DB",
                    description: "",
                    priority: "medium",
                    status: "todo",
                    estimatedHours: 2,
                    actualHours: 0,
                    deadline: "",
                    week: "",
                    createdAt: new Date().toISOString(),
                  },
                ],
                goals: [],
                applications: [],
                skills: [],
                settings: {
                  fullName: "Demo User",
                  email: "demo@prodex.io",
                  timezone: "UTC",
                  weeklyCapacity: 40,
                  showOverloadWarnings: true,
                  enableDeadlineReminders: true,
                },
              },
            }),
          } as Response
        }

        if (typeof input === "string" && input.includes("/api/v1/tasks/sync") && init?.method === "POST") {
          const body = typeof init.body === "string" ? JSON.parse(init.body) : { tasks: [] }
          return { ok: true, json: async () => ({ data: { tasks: body.tasks ?? [] } }) } as Response
        }

        if (typeof input === "string" && input.includes("/api/v1/sync") && init?.method === "POST") {
          return { ok: true, json: async () => ({}) } as Response
        }

        return { ok: false, json: async () => ({}) } as Response
      })
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("loads database data into context", async () => {
    render(
      <DataProvider>
        <DataConsumer />
      </DataProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId("task-count")).toHaveTextContent("1")
    })
    expect(screen.getByTestId("weekly-capacity")).toHaveTextContent("40")
  })

  it("updates tasks when setter is used", async () => {
    const user = userEvent.setup()

    render(
      <DataProvider>
        <DataConsumer />
      </DataProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId("task-count")).toHaveTextContent("1")
    })
    await user.click(screen.getByRole("button", { name: "Add task" }))
    expect(screen.getByTestId("task-count")).toHaveTextContent("2")
  })
})
