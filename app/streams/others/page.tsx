"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, GraduationCap, Layers, ArrowRight } from "lucide-react"

const STREAMS = [
  {
    title: "State CETs & other engineering",
    description: "State-level engineering entrance exams (MHT-CET, KCET, WBJEE, etc.) and other B.Tech entrance tests.",
    items: ["State-specific syllabus; often includes PCM + state board topics", "Multiple attempts in many states", "Check eligibility and counselling process for your state"],
  },
  {
    title: "CLAT / Law",
    description: "Common Law Admission Test for NLUs and other law colleges.",
    items: ["English, GK, Legal Aptitude, Logical Reasoning, Quantitative Techniques", "Current affairs important", "Reading speed and comprehension practice"],
  },
  {
    title: "CUET & other central/state exams",
    description: "CUET (UG) for central universities; other state and private university entrance tests.",
    items: ["Multi-domain: choose subjects as per course", "Section-wise preparation", "Check university-specific eligibility"],
  },
  {
    title: "Commerce & CA",
    description: "Commerce streams, CA Foundation, and related competitive exams.",
    items: ["Accountancy, Business Studies, Economics", "CA: CPT and IPCC stages", "Quantitative aptitude and law for CA"],
  },
]

function OthersContent() {
  return (
    <div className="container py-8 md:py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Other streams &amp; exams</h1>
          <p className="mt-2 text-muted-foreground">
            Resources and brief overviews for state exams, law, commerce, and other entrance tests beyond JEE and NEET.
          </p>
        </div>

        <section className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
          {STREAMS.map((stream) => (
            <Card key={stream.title}>
              <CardHeader>
                <CardTitle className="text-lg">{stream.title}</CardTitle>
                <CardDescription>{stream.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  {stream.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              General preparation tips
            </CardTitle>
            <CardDescription>Applicable across streams</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Understand the exam pattern and syllabus from the official website.</p>
            <p>• Use standard books and previous years’ papers. Join a test series if available.</p>
            <p>• Plan a study schedule and leave time for revision and mocks.</p>
            <p>• Stay updated with exam dates, eligibility, and counselling notifications.</p>
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

export default function OtherStreamsPage() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/auth/login?redirectTo=/streams/others")
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

  return <OthersContent />
}
