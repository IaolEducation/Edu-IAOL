"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Stethoscope, Target, FileText, ArrowRight } from "lucide-react"

function NEETContent() {
  return (
    <div className="container py-8 md:py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">NEET (National Eligibility cum Entrance Test)</h1>
          <p className="mt-2 text-muted-foreground">
            Single national-level medical entrance exam for MBBS, BDS, AYUSH and other medical courses. Conducted by NTA.
          </p>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Stethoscope className="h-5 w-5" />
                Eligibility
              </CardTitle>
              <CardDescription>
                Class 12 with Physics, Chemistry, Biology/Biotechnology. Minimum marks and age criteria apply.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Unreserved: 50% in PCB</li>
                <li>OBC/SC/ST: relaxed percentile</li>
                <li>Age: 17–25 (general)</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5" />
                Exam pattern
              </CardTitle>
              <CardDescription>
                One paper: 200 MCQs (180 to attempt). Physics 45, Chemistry 45, Biology 90. Negative marking.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>+4 for correct, -1 for incorrect</li>
                <li>Duration: 3h 20 min</li>
                <li>Language options available</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5" />
                Syllabus
              </CardTitle>
              <CardDescription>
                NCERT-based; Class 11 and 12 Physics, Chemistry, Botany and Zoology.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Biology carries maximum weightage</li>
                <li>Focus on diagrams and definitions</li>
                <li>Previous years’ papers very useful</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Preparation strategy
            </CardTitle>
            <CardDescription>Suggested approach for NEET aspirants</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">NCERT first:</strong> Read Biology and Chemistry NCERT line by line. Note exceptions and examples.
            </p>
            <p>
              <strong className="text-foreground">Practice:</strong> Solve MCQs daily. Use standard books and online question banks. Time yourself.
            </p>
            <p>
              <strong className="text-foreground">Revision:</strong> Regular revision of formulas (Physics/Chemistry) and diagrams (Biology). Mock tests every week.
            </p>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-4">
          <Button asChild>
            <Link href="/experiences" className="inline-flex items-center gap-2">
              Browse experiences <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/resources">Resources</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function NEETPage() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/auth/login?redirectTo=/streams/neet")
    }
  }, [loading, isAuthenticated, router])

  if (loading) {
    return (
      <div className="container py-12 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  if (!isAuthenticated) return null

  return <NEETContent />
}
