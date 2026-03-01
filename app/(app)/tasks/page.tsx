"use client"

import { useState, useMemo, useCallback } from "react"
import { useData } from "@/components/prodex/data-provider"
import { PriorityBadge } from "@/components/prodex/priority-badge"
import { generateId, type Task, type Priority, type TaskStatus } from "@/lib/store"
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Clock, GripVertical, MoreHorizontal, Plus, Search } from "lucide-react"

const columns: { key: TaskStatus; label: string }[] = [
  { key: "todo", label: "To Do" },
  { key: "in-progress", label: "In Progress" },
  { key: "done", label: "Done" },
  { key: "archived", label: "Archived" },
]

export default function TasksPage() {
  const { tasks, setTasks } = useData()
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterPriority, setFilterPriority] = useState<string>("all")
  const [modalOpen, setModalOpen] = useState(false)

  // Drag state
  const [dragId, setDragId] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<TaskStatus | null>(null)

  // New task form state
  const [newTitle, setNewTitle] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [newPriority, setNewPriority] = useState<Priority>("medium")
  const [newStatus, setNewStatus] = useState<TaskStatus>("todo")
  const [newEstimatedHours, setNewEstimatedHours] = useState("")
  const [newDeadline, setNewDeadline] = useState("")
  const [newWeek, setNewWeek] = useState("")
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editPriority, setEditPriority] = useState<Priority>("medium")
  const [editStatus, setEditStatus] = useState<TaskStatus>("todo")
  const [editEstimatedHours, setEditEstimatedHours] = useState("")
  const [editDeadline, setEditDeadline] = useState("")
  const [editWeek, setEditWeek] = useState("")

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
      if (filterStatus !== "all" && t.status !== filterStatus) return false
      if (filterPriority !== "all" && t.priority !== filterPriority) return false
      return true
    })
  }, [tasks, search, filterStatus, filterPriority])

  const resetForm = () => {
    setNewTitle("")
    setNewDescription("")
    setNewPriority("medium")
    setNewStatus("todo")
    setNewEstimatedHours("")
    setNewDeadline("")
    setNewWeek("")
  }

  const handleCreate = () => {
    if (!newTitle.trim()) return
    const task: Task = {
      id: generateId(),
      title: newTitle.trim(),
      description: newDescription.trim(),
      priority: newPriority,
      status: newStatus,
      estimatedHours: parseFloat(newEstimatedHours) || 0,
      actualHours: 0,
      deadline: newDeadline,
      week: newWeek,
      createdAt: new Date().toISOString(),
    }
    setTasks((prev) => [...prev, task])
    resetForm()
    setModalOpen(false)
  }

  // Drag handlers
  const handleDragStart = useCallback((taskId: string) => {
    setDragId(taskId)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, colKey: TaskStatus) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDropTarget(colKey)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDropTarget(null)
  }, [])

  const handleDrop = useCallback(
    (colKey: TaskStatus) => {
      if (dragId) {
        setTasks((prev) =>
          prev.map((t) => (t.id === dragId ? { ...t, status: colKey } : t))
        )
      }
      setDragId(null)
      setDropTarget(null)
    },
    [dragId, setTasks]
  )

  const handleDragEnd = useCallback(() => {
    setDragId(null)
    setDropTarget(null)
  }, [])

  const handlePriorityChange = useCallback((taskId: string, priority: Priority) => {
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, priority } : task)))
  }, [setTasks])

  const handleDeleteTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId))
  }, [setTasks])

  const openEditModal = useCallback((task: Task) => {
    setEditingTaskId(task.id)
    setEditTitle(task.title)
    setEditDescription(task.description || "")
    setEditPriority(task.priority)
    setEditStatus(task.status)
    setEditEstimatedHours(task.estimatedHours ? String(task.estimatedHours) : "")
    setEditDeadline(task.deadline || "")
    setEditWeek(task.week || "")
  }, [])

  const handleSaveEdit = useCallback(() => {
    if (!editingTaskId) return
    setTasks((prev) =>
      prev.map((task) =>
        task.id === editingTaskId
          ? {
              ...task,
              title: editTitle.trim() || task.title,
              description: editDescription.trim(),
              priority: editPriority,
              status: editStatus,
              estimatedHours: parseFloat(editEstimatedHours) || 0,
              deadline: editDeadline,
              week: editWeek,
            }
          : task
      )
    )
    setEditingTaskId(null)
  }, [editingTaskId, editDeadline, editDescription, editEstimatedHours, editPriority, editStatus, editTitle, editWeek, setTasks])

  return (
    <div className="flex flex-col gap-6">
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow]"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[130px] bg-card">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="todo">Todo</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-[130px] bg-card">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <button
          onClick={() => setModalOpen(true)}
          className="ml-auto flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Task
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.key)
          const isOver = dropTarget === col.key
          return (
            <div
              key={col.key}
              className="flex flex-col"
              onDragOver={(e) => handleDragOver(e, col.key)}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop(col.key)}
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-card-foreground">{col.label}</h3>
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground">
                  {colTasks.length}
                </span>
              </div>
              <div
                className={`flex flex-1 flex-col gap-3 min-h-[200px] rounded-lg p-2 transition-colors ${
                  isOver
                    ? "bg-accent/10 ring-2 ring-accent/40 ring-dashed"
                    : "bg-transparent"
                }`}
              >
                {colTasks.length === 0 ? (
                  <div className={`flex flex-1 items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
                    isOver ? "border-accent/40 bg-accent/5" : "border-border"
                  }`}>
                    <p className="text-sm text-muted-foreground">
                      {isOver ? "Drop here" : "No tasks here"}
                    </p>
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      isDragging={dragId === task.id}
                      onDragStart={() => handleDragStart(task.id)}
                      onDragEnd={handleDragEnd}
                      onSetPriority={(priority) => handlePriorityChange(task.id, priority)}
                      onDelete={() => handleDeleteTask(task.id)}
                      onEdit={() => openEditModal(task)}
                    />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* New Task Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-card-foreground">Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Task title"
                className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-card-foreground">Description</label>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Task description"
                rows={3}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow] resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-card-foreground">Priority</label>
                <Select value={newPriority} onValueChange={(v) => setNewPriority(v as Priority)}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-card-foreground">Status</label>
                <Select value={newStatus} onValueChange={(v) => setNewStatus(v as TaskStatus)}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">Todo</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-card-foreground">Estimated Hours</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={newEstimatedHours}
                onChange={(e) => setNewEstimatedHours(e.target.value)}
                placeholder="0"
                className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-card-foreground">Deadline</label>
                <input
                  type="date"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-card-foreground">Assign to Week</label>
                <input
                  type="date"
                  value={newWeek}
                  onChange={(e) => setNewWeek(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow]"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => { resetForm(); setModalOpen(false) }}
              className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-card-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Create Task
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Modal */}
      <Dialog open={!!editingTaskId} onOpenChange={(open) => { if (!open) setEditingTaskId(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-card-foreground">Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-card-foreground">Description</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow] resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-card-foreground">Priority</label>
                <Select value={editPriority} onValueChange={(v) => setEditPriority(v as Priority)}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-card-foreground">Status</label>
                <Select value={editStatus} onValueChange={(v) => setEditStatus(v as TaskStatus)}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">Todo</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-card-foreground">Estimated Hours</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={editEstimatedHours}
                  onChange={(e) => setEditEstimatedHours(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-card-foreground">Deadline</label>
                <input
                  type="date"
                  value={editDeadline}
                  onChange={(e) => setEditDeadline(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow]"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-card-foreground">Assign to Week</label>
              <input
                type="date"
                value={editWeek}
                onChange={(e) => setEditWeek(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow]"
              />
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setEditingTaskId(null)}
              className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-card-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
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

function TaskCard({
  task,
  isDragging,
  onDragStart,
  onDragEnd,
  onSetPriority,
  onDelete,
  onEdit,
}: {
  task: Task
  isDragging: boolean
  onDragStart: () => void
  onDragEnd: () => void
  onSetPriority: (priority: Priority) => void
  onDelete: () => void
  onEdit: () => void
}) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move"
        e.dataTransfer.setData("text/plain", task.id)
        onDragStart()
      }}
      onDragEnd={onDragEnd}
      className={`group rounded-lg bg-card p-4 shadow-sm border border-border cursor-grab active:cursor-grabbing transition-all ${
        isDragging ? "opacity-40 scale-95 ring-2 ring-accent/40" : "hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-2 flex-1">
          <GripVertical className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
          <h4 className="text-sm font-medium text-card-foreground leading-snug">{task.title}</h4>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="ml-2 inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-card-foreground"
              aria-label="Task actions"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            onClick={(e) => e.stopPropagation()}
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <DropdownMenuItem onClick={() => onSetPriority("critical")}>Critical</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSetPriority("high")}>High</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSetPriority("medium")}>Medium</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSetPriority("low")}>Low</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={onDelete}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex flex-wrap items-center gap-2 pl-6">
        <PriorityBadge priority={task.priority} />
        {task.deadline && (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {new Date(task.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        )}
        {task.estimatedHours > 0 && (
          <span className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
            {task.estimatedHours}h
          </span>
        )}
      </div>
    </div>
  )
}
