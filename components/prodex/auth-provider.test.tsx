import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AuthProvider, useAuth } from "@/components/prodex/auth-provider"
import { usePathname, useRouter } from "next/navigation"

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}))

function AuthConsumer() {
  const { login, logout } = useAuth()
  return (
    <div>
      <button onClick={() => login("user@example.com", "password123")}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

describe("AuthProvider", () => {
  const replaceMock = vi.fn()

  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    vi.mocked(useRouter).mockReturnValue({ replace: replaceMock } as never)
    vi.mocked(usePathname).mockReturnValue("/dashboard")
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        if (typeof input === "string" && input.includes("/api/v1/auth/me")) {
          if (localStorage.getItem("prodex_token") === "valid-token") {
            return {
              ok: true,
              json: async () => ({ user: { id: "u1", fullName: "User One", email: "user@example.com" } }),
            } as Response
          }
          return { ok: false, json: async () => ({ error: "Unauthorized" }) } as Response
        }

        if (typeof input === "string" && input.includes("/api/v1/auth/signin") && init?.method === "POST") {
          return {
            ok: true,
            json: async () => ({ token: "new-token", user: { id: "u1", fullName: "User One", email: "user@example.com" } }),
          } as Response
        }

        return { ok: false, json: async () => ({ error: "Unhandled route" }) } as Response
      })
    )
  })

  it("redirects unauthenticated user from private route to login", async () => {
    render(
      <AuthProvider>
        <div>Protected app</div>
      </AuthProvider>
    )

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/login")
    })
  })

  it("redirects authenticated user away from public routes", async () => {
    localStorage.setItem("prodex_token", "valid-token")
    vi.mocked(usePathname).mockReturnValue("/login")

    render(
      <AuthProvider>
        <div>Login page</div>
      </AuthProvider>
    )

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/dashboard")
    })
  })

  it("stores backend token and redirects on login", async () => {
    const user = userEvent.setup()
    vi.mocked(usePathname).mockReturnValue("/login")

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )

    await user.click(screen.getByRole("button", { name: "Login" }))

    expect(localStorage.getItem("prodex_token")).toBe("new-token")
    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/dashboard")
    })
  })

  it("clears token and redirects on logout", async () => {
    const user = userEvent.setup()
    localStorage.setItem("prodex_token", "valid-token")

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )

    await screen.findByRole("button", { name: "Logout" })
    await user.click(screen.getByRole("button", { name: "Logout" }))

    expect(localStorage.getItem("prodex_token")).toBeNull()
    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/login")
    })
  })
})
