"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, FileText, BookOpen, MessageSquare, ArrowRight } from "lucide-react"
import RequireLogin from "@/components/require-login"

function ProfessionalDashboardContent() {
  return (
    <div className="container py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Professional Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Share your experience and help the community</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Share Your Experience
            </CardTitle>
            <CardDescription>Submit your placement or career journey to help students</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/submit">
                Submit <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Browse Experiences
            </CardTitle>
            <CardDescription>Read and compare experiences from others</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/experiences">View Experiences</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Resources
            </CardTitle>
            <CardDescription>Contribute or use career and interview resources</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/resources">Resources</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="sm:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Companies
            </CardTitle>
            <CardDescription>View company profiles and placement stats</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/companies">Explore Companies</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ProfessionalDashboardPage() {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!isAuthenticated || !user) {
      router.replace("/auth/login?redirectTo=/dashboard/professional")
      return
    }
    if (user.userType === null) {
      router.replace("/onboarding")
      return
    }
  }, [loading, isAuthenticated, user, router])

  if (loading || !user) return null
  if (!isAuthenticated || user.userType === null) return null

  return (
    <RequireLogin>
      <ProfessionalDashboardContent />
    </RequireLogin>
  )
}
