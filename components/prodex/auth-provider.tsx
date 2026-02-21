"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"

interface AuthContextType {
  isAuthenticated: boolean
  login: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const token = localStorage.getItem("prodex_token")
    setIsAuthenticated(!!token)
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

  const login = () => {
    localStorage.setItem("prodex_token", "prodex_session_" + Date.now())
    setIsAuthenticated(true)
    router.replace("/dashboard")
  }

  const logout = () => {
    localStorage.removeItem("prodex_token")
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
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
