"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { Search, FolderOpen, RefreshCcw } from "lucide-react"

type ResourceCategory = {
  id: string
  name: string
  slug: string
  description: string
  resourceCount: number
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

export default function ResourcesPage() {
  const [categories, setCategories] = useState<ResourceCategory[]>([])
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const loadCategories = async () => {
    setIsLoading(true)
    setError("")
    try {
      const response = await fetch(`${API_BASE}/api/v1/resources/categories`, { cache: "no-store" })
      if (!response.ok) {
        throw new Error("Unable to load categories")
      }
      const json = await response.json()
      setCategories(json?.data || [])
    } catch (e) {
      console.error(e)
      setError("Could not load resource categories. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return categories
    return categories.filter((category) =>
      `${category.name} ${category.description}`.toLowerCase().includes(term)
    )
  }, [categories, query])

  return (
    <div className="flex flex-col gap-6">
      <div className="relative max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search resource categories..."
          className="h-10 w-full rounded-md border border-input bg-card pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="h-36 animate-pulse rounded-lg border border-border bg-card/60" />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive">
          <p>{error}</p>
          <button
            type="button"
            onClick={loadCategories}
            className="inline-flex w-fit items-center gap-2 rounded-md border border-destructive/30 bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
          No categories found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((category) => (
            <Link
              key={category.id}
              href={`/resources/${category.slug}`}
              className="group rounded-lg border border-border bg-card p-5 shadow-sm transition-colors hover:bg-muted/40"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold text-card-foreground">{category.name}</h3>
                <FolderOpen className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
              </div>
              <p className="mb-3 text-sm text-muted-foreground">{category.description || "No description available."}</p>
              <p className="text-xs font-medium uppercase tracking-wide text-accent">
                {category.resourceCount} Resources
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
