"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function RequireLogin({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return
    if (!isAuthenticated) {
      const redirectTo = pathname ? `/auth/login?redirectTo=${encodeURIComponent(pathname)}` : "/auth/login"
      router.replace(redirectTo)
    }
  }, [loading, isAuthenticated, router, pathname])

  if (loading) {
    return (
      <div className="container py-12 flex items-center justify-center min-h-[200px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  if (!isAuthenticated) return null
  return <>{children}</>
}
