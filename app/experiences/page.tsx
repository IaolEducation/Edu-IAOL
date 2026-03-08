import type { Metadata } from "next"
import ExperienceFilter from "@/components/experience-filter"
import ExperienceList from "@/components/experience-list"
import RequireLogin from "@/components/require-login"

export const metadata: Metadata = {
  title: "Experiences | Eduiaol",
  description: "Browse placement & career experiences, preparation insights, and advice from students and professionals",
}

export default function ExperiencesPage() {
  return (
    <RequireLogin>
      <div className="container px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12 min-h-[60vh]">
        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Experiences</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Placement stories, interview tips, and preparation insights from college students and professionals.
            </p>
          </div>
          <ExperienceFilter />
          <ExperienceList />
        </div>
      </div>
    </RequireLogin>
  )
}

