"use client"

import { AuthProvider } from "@/components/prodex/auth-provider"
import { DataProvider } from "@/components/prodex/data-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DataProvider>
        {children}
      </DataProvider>
    </AuthProvider>
  )
}
