"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GraduationCap, BookOpen, Briefcase } from "lucide-react"
import type { UserType } from "@/contexts/auth-context"
import RequireLogin from "@/components/require-login"
import Link from "next/link"

const OPTIONS: { type: UserType; title: string; description: string; icon: React.ReactNode }[] = [
  { type: "college_student", title: "College Student", description: "Placement, internships, campus recruitment", icon: <GraduationCap className="h-8 w-8" /> },
  { type: "student", title: "Student", description: "JEE, NEET, exam preparation", icon: <BookOpen className="h-8 w-8" /> },
  { type: "professional", title: "Professional", description: "Working — share experience, mentor", icon: <Briefcase className="h-8 w-8" /> },
]

export default function ProfileSettingsPage() {
  const { user, updateUserType } = useAuth()
  const router = useRouter()

  const handleSelect = async (type: UserType) => {
    await updateUserType(type)
    const href = type === "college_student" ? "/dashboard/college" : type === "student" ? "/dashboard/student" : "/dashboard/professional"
    router.push(href)
  }

  return (
    <RequireLogin>
      <div className="container max-w-2xl py-8 md:py-12">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Profile type</h1>
          <p className="mt-1 text-muted-foreground">Choose how you use Eduiaol. This changes your dashboard and highlighted links.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Current profile</CardTitle>
            <CardDescription>
              {user?.userType === "college_student" && "College Student"}
              {user?.userType === "student" && "Student (exam prep)"}
              {user?.userType === "professional" && "Professional"}
              {!user?.userType && "Not set — choose below."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {OPTIONS.map((opt) => (
              <div
                key={opt.type}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {opt.icon}
                  </div>
                  <div>
                    <p className="font-medium">{opt.title}</p>
                    <p className="text-sm text-muted-foreground">{opt.description}</p>
                  </div>
                </div>
                <Button
                  variant={user?.userType === opt.type ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => handleSelect(opt.type)}
                >
                  {user?.userType === opt.type ? "Current" : "Switch"}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
        <div className="mt-4">
          <Button asChild variant="ghost">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </RequireLogin>
  )
}
