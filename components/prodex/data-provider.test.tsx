import React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
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
  it("loads sample data into context", () => {
    render(
      <DataProvider>
        <DataConsumer />
      </DataProvider>
    )

    expect(screen.getByTestId("task-count")).toHaveTextContent("12")
    expect(screen.getByTestId("weekly-capacity")).toHaveTextContent("40")
  })

  it("updates tasks when setter is used", async () => {
    const user = userEvent.setup()

    render(
      <DataProvider>
        <DataConsumer />
      </DataProvider>
    )

    await user.click(screen.getByRole("button", { name: "Add task" }))
    expect(screen.getByTestId("task-count")).toHaveTextContent("13")
  })
})
