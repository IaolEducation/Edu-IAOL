"use client"

import { usePathname } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import type React from "react"

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isMessagesRoute = pathname.startsWith("/messages")
  const isHomePage = pathname === "/"

  if (isMessagesRoute) {
    // No header, no footer — full-screen chat
    return <div className="flex min-h-screen flex-col">{children}</div>
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      {isHomePage && <Footer />}
    </div>
  )
}
