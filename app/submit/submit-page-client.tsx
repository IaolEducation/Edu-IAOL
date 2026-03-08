"use client"

import SubmissionForm from "@/components/submission-form"
import StudentShareForm from "@/components/student-share-form"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText, Briefcase } from "lucide-react"

export default function SubmitPageClient() {
  const { user } = useAuth()
  const isStudent = user?.userType === "student"
  const isCollegeOrPro = user?.userType === "college_student" || user?.userType === "professional"

  return (
    <div className="container px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {isStudent ? "Share notes & resources" : isCollegeOrPro ? "Share your placement experience" : "Share"}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {isStudent
              ? "Share study notes, resources, references or anything that can help other students."
              : isCollegeOrPro
                ? "Help others by sharing your placement journey, interview process, and preparation tips."
                : "Choose what you want to share below."}
          </p>
        </div>

        {isStudent && (
          <>
            <StudentShareForm />
            <div className="rounded-lg border border-dashed p-4 text-center">
              <p className="text-sm text-muted-foreground mb-3">Have a placement or internship experience to share?</p>
              <Button asChild variant="outline" size="sm" className="gap-2">
                <Link href="/submit/experience"><Briefcase className="h-4 w-4" /> Share placement experience</Link>
              </Button>
            </div>
          </>
        )}

        {isCollegeOrPro && (
          <>
            <SubmissionForm />
            <div className="rounded-lg border border-dashed p-4 text-center">
              <p className="text-sm text-muted-foreground mb-3">Want to share notes or resources instead?</p>
              <Button asChild variant="outline" size="sm" className="gap-2">
                <Link href="/submit/notes"><FileText className="h-4 w-4" /> Share notes & resources</Link>
              </Button>
            </div>
          </>
        )}

        {!isStudent && !isCollegeOrPro && user && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Link href="/submit/experience" className="block">
              <div className="rounded-xl border-2 border-muted bg-card p-6 hover:border-primary/50 hover:bg-muted/30 transition-colors h-full">
                <Briefcase className="h-10 w-10 text-primary mb-3" />
                <h2 className="font-semibold text-lg mb-1">Placement experience</h2>
                <p className="text-sm text-muted-foreground">Share your placement or internship journey.</p>
              </div>
            </Link>
            <Link href="/submit/notes" className="block">
              <div className="rounded-xl border-2 border-muted bg-card p-6 hover:border-primary/50 hover:bg-muted/30 transition-colors h-full">
                <FileText className="h-10 w-10 text-primary mb-3" />
                <h2 className="font-semibold text-lg mb-1">Notes & resources</h2>
                <p className="text-sm text-muted-foreground">Share study notes, resources or references.</p>
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
