import { describe, expect, it } from "vitest"
import { cn } from "@/lib/utils"

describe("cn", () => {
  it("merges tailwind classes with conflict resolution", () => {
    expect(cn("px-2", "px-4", "text-sm")).toBe("px-4 text-sm")
  })

  it("filters falsy values and keeps valid classes", () => {
    expect(cn("font-medium", false && "hidden", null, "text-xs")).toBe("font-medium text-xs")
  })
})
