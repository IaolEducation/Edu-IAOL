"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calculator, Stethoscope, Layers, BookOpen, ArrowRight } from "lucide-react"
import RequireLogin from "@/components/require-login"

function StudentDashboardContent() {
  return (
    <div className="container py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Exam Preparation Dashboard</h1>
        <p className="mt-1 text-muted-foreground">JEE, NEET, and other entrance exam resources</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              JEE
            </CardTitle>
            <CardDescription>JEE Main & Advanced — syllabus, strategy, and preparation</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/streams/jee">
                Open JEE <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              NEET
            </CardTitle>
            <CardDescription>NEET — biology, chemistry, physics and exam pattern</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/streams/neet">Open NEET</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Other Streams
            </CardTitle>
            <CardDescription>State exams, CLAT, CUET, Commerce & more</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/streams/others">View Streams</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Share notes & resources
            </CardTitle>
            <CardDescription>Share your notes, references, or resources with other students</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/submit">Share notes & resources</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="sm:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Study Resources
            </CardTitle>
            <CardDescription>Curated materials, previous papers, and preparation guides</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/resources">Go to Resources</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function StudentDashboardPage() {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!isAuthenticated || !user) {
      router.replace("/auth/login?redirectTo=/dashboard/student")
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
      <StudentDashboardContent />
    </RequireLogin>
  )
}
