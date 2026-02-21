"use client"

import { PageShell } from "@/components/prodex/page-shell"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <PageShell>{children}</PageShell>
}
