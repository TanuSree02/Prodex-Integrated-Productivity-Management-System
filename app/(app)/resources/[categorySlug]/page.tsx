"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { ArrowLeft, ExternalLink, RefreshCcw, Search } from "lucide-react"

type ResourceItem = {
  id: string
  title: string
  description: string
  tags: string[]
  url: string
}

type CategoryPayload = {
  id: string
  name: string
  slug: string
  description: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

export default function ResourceCategoryPage() {
  const params = useParams<{ categorySlug: string }>()
  const categorySlug = Array.isArray(params?.categorySlug) ? params.categorySlug[0] : params?.categorySlug
  const [category, setCategory] = useState<CategoryPayload | null>(null)
  const [resources, setResources] = useState<ResourceItem[]>([])
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const loadCategoryResources = async (slug: string) => {
    setIsLoading(true)
    setError("")
    try {
      const response = await fetch(`${API_BASE}/api/v1/resources/categories/${encodeURIComponent(slug)}`, {
        cache: "no-store",
      })
      if (!response.ok) {
        if (response.status === 404) {
          setError("Category not found.")
          setCategory(null)
          setResources([])
          return
        }
        throw new Error("Unable to load category resources")
      }

      const json = await response.json()
      setCategory(json?.data?.category || null)
      setResources(json?.data?.resources || [])
    } catch (e) {
      console.error(e)
      setError("Could not load resources. Please try again.")
      setCategory(null)
      setResources([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!categorySlug) {
      setIsLoading(false)
      setError("Category not found.")
      return
    }
    loadCategoryResources(categorySlug)
  }, [categorySlug])

  const filteredResources = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return resources
    return resources.filter((item) =>
      `${item.title} ${item.description} ${(item.tags || []).join(" ")}`.toLowerCase().includes(term)
    )
  }, [resources, query])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Link
          href="/resources"
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Categories
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-28 animate-pulse rounded-lg border border-border bg-card/60" />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-36 animate-pulse rounded-lg border border-border bg-card/60" />
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => {
              if (!categorySlug) return
              loadCategoryResources(categorySlug)
            }}
            className="inline-flex w-fit items-center gap-2 rounded-md border border-destructive/30 bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      ) : (
        <>
          <section className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-2xl font-semibold text-card-foreground">{category?.name || "Resources"}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{category?.description || "No description available."}</p>
          </section>

          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search resources in this category..."
              className="h-10 w-full rounded-md border border-input bg-card pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </div>

          {filteredResources.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
              No resources available in this category.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {filteredResources.map((resource) => (
                <article key={resource.id} className="rounded-lg border border-border bg-card p-5 shadow-sm">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <h3 className="text-base font-semibold text-card-foreground">{resource.title}</h3>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      Visit
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                  <p className="text-sm text-muted-foreground">{resource.description || "No description available."}</p>
                  {resource.tags?.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {resource.tags.map((tag) => (
                        <span
                          key={`${resource.id}-${tag}`}
                          className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
