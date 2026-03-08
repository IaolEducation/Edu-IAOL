"use client"

import SubmissionForm from "@/components/submission-form"
import RequireLogin from "@/components/require-login"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

export default function SubmitExperiencePage() {
  return (
    <RequireLogin>
      <div className="container px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12">
        <div className="mx-auto max-w-3xl space-y-6">
          <Button variant="ghost" size="sm" asChild className="-ml-2 gap-1">
            <Link href="/submit"><ChevronLeft className="h-4 w-4" /> Back to Share</Link>
          </Button>
          <div className="space-y-2 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Share your placement experience</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Help others by sharing your placement journey, interview process, and preparation tips.
            </p>
          </div>
          <SubmissionForm />
        </div>
      </div>
    </RequireLogin>
  )
}
