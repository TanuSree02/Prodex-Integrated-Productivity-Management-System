"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
const TOKEN_KEY = "prodex_token"

interface AuthUser {
  id: string
  fullName: string
  email: string
}

interface AuthContextType {
  isAuthenticated: boolean
  user: AuthUser | null
  isAuthLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (payload: { fullName: string; email: string; password: string; confirmPassword: string }) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  isAuthLoading: true,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const json = await response.json()
    return json?.error || "Request failed"
  } catch {
    return "Request failed"
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem(TOKEN_KEY)
      if (!token) {
        setIsAuthenticated(false)
        return
      }

      try {
        const response = await fetch(`${API_BASE}/api/v1/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!response.ok) {
          localStorage.removeItem(TOKEN_KEY)
          setIsAuthenticated(false)
          setUser(null)
          return
        }

        const json = await response.json()
        setUser(json?.user || null)
        setIsAuthenticated(true)
      } catch {
        localStorage.removeItem(TOKEN_KEY)
        setIsAuthenticated(false)
        setUser(null)
      }
    }

    initializeAuth()
  }, [])

  useEffect(() => {
    if (isAuthenticated === null) return
    const publicRoutes = ["/login", "/signup"]
    if (!isAuthenticated && !publicRoutes.includes(pathname)) {
      router.replace("/login")
    }
    if (isAuthenticated && publicRoutes.includes(pathname)) {
      router.replace("/dashboard")
    }
  }, [isAuthenticated, pathname, router])

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE}/api/v1/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      throw new Error(await extractErrorMessage(response))
    }

    const json = await response.json()
    localStorage.setItem(TOKEN_KEY, json.token)
    setUser(json.user)
    setIsAuthenticated(true)
    router.replace("/dashboard")
  }

  const signup = async (payload: { fullName: string; email: string; password: string; confirmPassword: string }) => {
    const response = await fetch(`${API_BASE}/api/v1/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(await extractErrorMessage(response))
    }

    const json = await response.json()
    localStorage.setItem(TOKEN_KEY, json.token)
    setUser(json.user)
    setIsAuthenticated(true)
    router.replace("/dashboard")
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
    setIsAuthenticated(false)
    router.replace("/login")
  }

  if (isAuthenticated === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isAuthLoading: isAuthenticated === null, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
