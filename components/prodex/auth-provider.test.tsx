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
      <button onClick={login}>Login</button>
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
    localStorage.setItem("prodex_token", "existing-token")
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

  it("stores token and redirects on login", async () => {
    const user = userEvent.setup()
    vi.mocked(usePathname).mockReturnValue("/login")

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )

    await user.click(screen.getByRole("button", { name: "Login" }))

    expect(localStorage.getItem("prodex_token")).toContain("prodex_session_")
    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/dashboard")
    })
  })

  it("clears token and redirects on logout", async () => {
    const user = userEvent.setup()
    localStorage.setItem("prodex_token", "existing-token")

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )

    await user.click(screen.getByRole("button", { name: "Logout" }))

    expect(localStorage.getItem("prodex_token")).toBeNull()
    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/login")
    })
  })
})
