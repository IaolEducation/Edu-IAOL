"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building, FileText, BookOpen, Users, Search, ArrowRight } from "lucide-react"
import RequireLogin from "@/components/require-login"

function CollegeDashboardContent() {
  return (
    <div className="container py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">College Student Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Placement, internships, and career preparation</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Experiences
            </CardTitle>
            <CardDescription>Browse placement & internship experiences shared by seniors</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/experiences">
                Browse <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Companies
            </CardTitle>
            <CardDescription>Explore companies and placement statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/companies">View Companies</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Share Your Story
            </CardTitle>
            <CardDescription>Submit your placement or internship experience</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/submit">Submit Experience</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Resume Builder
            </CardTitle>
            <CardDescription>Build and polish your resume</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/resume-builder">Open Resume Builder</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Resources
            </CardTitle>
            <CardDescription>Preparation guides, interview tips, and materials</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/resources">View Resources</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function CollegeDashboardPage() {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!isAuthenticated || !user) {
      router.replace("/auth/login?redirectTo=/dashboard/college")
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
      <CollegeDashboardContent />
    </RequireLogin>
  )
}
