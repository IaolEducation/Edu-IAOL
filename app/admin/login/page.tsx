"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { Info } from "lucide-react"

export default function AdminLoginPage() {
  const router = useRouter()
  const { isAdmin, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      router.replace("/admin")
    }
  }, [isAuthenticated, isAdmin, router])

  if (isAuthenticated && isAdmin) {
    return null
  }

  return (
    <div className="container py-8 md:py-12">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Admin access</CardTitle>
            <CardDescription>
              There is no separate admin login. Sign in on the main page with your admin account (Google or email) to access the admin dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-muted/50 p-4 flex items-start gap-3">
              <Info className="h-5 w-5 shrink-0 text-muted-foreground mt-0.5" />
              <p className="text-sm text-muted-foreground">
                If you are an admin, use the Sign in button and sign in with <strong>talibhassan1122@gmail.com</strong> or <strong>iaoleducation65@gmail.com</strong>. You will then see the Admin link and can open the dashboard.
              </p>
            </div>
            <Button asChild className="w-full">
              <Link href="/auth/login?redirectTo=/admin">Go to Sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
