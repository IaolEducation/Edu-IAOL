"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function DashboardPage() {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!isAuthenticated || !user) {
      router.replace("/auth/login?redirectTo=/dashboard")
      return
    }
    if (user.role === "admin") {
      router.replace("/admin")
      return
    }
    if (user.userType === null) {
      router.replace("/onboarding")
      return
    }
    switch (user.userType) {
      case "college_student":
        router.replace("/dashboard/college")
        break
      case "student":
        router.replace("/dashboard/student")
        break
      case "professional":
        router.replace("/dashboard/professional")
        break
      default:
        router.replace("/onboarding")
    }
  }, [loading, isAuthenticated, user, router])

  return (
    <div className="container flex min-h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )
}
