"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { GraduationCap, BookOpen, Briefcase, AlertTriangle, ArrowRight } from "lucide-react"
import type { UserType } from "@/contexts/auth-context"

const OPTIONS: { type: UserType; title: string; description: string; icon: React.ReactNode; href: string }[] = [
  {
    type: "college_student",
    title: "College Student",
    description: "I'm in college — placement, internships, campus recruitment, and career prep.",
    icon: <GraduationCap className="h-10 w-10" />,
    href: "/dashboard/college",
  },
  {
    type: "student",
    title: "Student",
    description: "I'm preparing for exams — JEE, NEET, or other entrance exams and study resources.",
    icon: <BookOpen className="h-10 w-10" />,
    href: "/dashboard/student",
  },
  {
    type: "professional",
    title: "Professional",
    description: "I'm working — share my experience, mentor, and contribute to the community.",
    icon: <Briefcase className="h-10 w-10" />,
    href: "/dashboard/professional",
  },
]

export default function OnboardingPage() {
  const { user, loading, isAuthenticated, isAdmin, updateUserType, updateContactInfo } = useAuth()
  const router = useRouter()

  const [submitting, setSubmitting] = useState<string | null>(null)
  const [step, setStep] = useState<1 | 2>(1)
  const [dashboardHref, setDashboardHref] = useState("/dashboard")

  // Contact info fields
  const [username, setUsername] = useState("")
  const [phone, setPhone] = useState("")
  const [bio, setBio] = useState("")
  const [instagram, setInstagram] = useState("")
  const [linkedin, setLinkedin] = useState("")
  const [facebook, setFacebook] = useState("")
  const [publicEmail, setPublicEmail] = useState("")
  const [savingContact, setSavingContact] = useState(false)

  useEffect(() => {
    if (loading) return
    if (!isAuthenticated || !user) {
      router.replace("/auth/login?redirectTo=/onboarding")
      return
    }
    if (isAdmin) {
      router.replace("/admin")
      return
    }
    // Only redirect if they already have a type AND we're still on step 1 (e.g. returning user).
    // When step === 2 we let them finish contact info before redirecting.
    if (user.userType && step === 1) {
      router.replace(OPTIONS.find((o) => o.type === user.userType)?.href ?? "/dashboard")
      return
    }
  }, [loading, isAuthenticated, user, isAdmin, step, router])

  const handleSelect = async (option: (typeof OPTIONS)[0]) => {
    setSubmitting(option.type)
    try {
      await updateUserType(option.type)
      setDashboardHref(option.href)
      setStep(2)
    } catch {
      // Error toast is shown by updateUserType
    } finally {
      setSubmitting(null)
    }
  }

  const handleSaveContact = async () => {
    setSavingContact(true)
    try {
      await updateContactInfo({ username, phone, bio, instagram, linkedin, facebook, publicEmail })
      router.push(dashboardHref)
    } catch {
      // Error toast is shown by updateContactInfo
    } finally {
      setSavingContact(false)
    }
  }

  const handleSkip = () => {
    router.push(dashboardHref)
  }

  // Spinner: while auth is loading, or no user, or admin (redirecting), or already has type and still on step 1 (redirecting).
  // When step === 2 we do NOT show spinner even if user.userType is set, so they can complete contact info.
  if (loading || !user || isAdmin || (user.userType != null && step === 1)) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  // ── Step 1: Choose Profession ──
  if (step === 1) {
    return (
      <div className="container max-w-4xl py-12 md:py-16">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">How would you like to use Eduiaol?</h1>
          <p className="mt-2 text-muted-foreground">Choose your profile. You can change this later in settings.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {OPTIONS.map((option) => (
            <Card
              key={option.type}
              className="cursor-pointer transition-all hover:border-primary hover:shadow-md"
              onClick={() => handleSelect(option)}
            >
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {option.icon}
                </div>
                <CardTitle>{option.title}</CardTitle>
                <CardDescription>{option.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" disabled={submitting !== null}>
                  {submitting === option.type ? "Saving..." : "Continue"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // ── Step 2: Contact & Social Info ──
  return (
    <div className="container max-w-xl py-10 md:py-14">
      {/* Skip button */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Step 2 of 2</p>
          <h1 className="text-2xl font-bold tracking-tight mt-0.5">Contact &amp; Social Info</h1>
          <p className="text-sm text-muted-foreground mt-1">
            This info is public and shown on your profile so students can reach you.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleSkip} className="gap-1.5 shrink-0 text-muted-foreground">
          Skip for now <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-3.5 mb-6">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800 dark:text-amber-300">
          Only add your number if you are comfortable being contacted by students. You are responsible for what you share.
        </p>
      </div>

      <div className="space-y-5">
        {/* Username */}
        <div className="space-y-1.5">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            placeholder="yourhandle"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">Shown as @yourhandle on your profile</p>
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone / WhatsApp</Label>
          <Input
            id="phone"
            placeholder="+91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">Shown publicly — add with country code</p>
        </div>

        {/* Bio */}
        <div className="space-y-1.5">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            placeholder="Tell others about yourself — your year, branch, company, or goals…"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
          />
        </div>

        {/* Instagram */}
        <div className="space-y-1.5">
          <Label htmlFor="instagram">Instagram</Label>
          <Input
            id="instagram"
            placeholder="username or URL"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
          />
        </div>

        {/* LinkedIn */}
        <div className="space-y-1.5">
          <Label htmlFor="linkedin">LinkedIn</Label>
          <Input
            id="linkedin"
            placeholder="profile URL or username"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
          />
        </div>

        {/* Facebook */}
        <div className="space-y-1.5">
          <Label htmlFor="facebook">Facebook</Label>
          <Input
            id="facebook"
            placeholder="profile URL or username"
            value={facebook}
            onChange={(e) => setFacebook(e.target.value)}
          />
        </div>

        {/* Public Email */}
        <div className="space-y-1.5">
          <Label htmlFor="publicEmail">Public Email</Label>
          <Input
            id="publicEmail"
            type="email"
            placeholder="contact@example.com"
            value={publicEmail}
            onChange={(e) => setPublicEmail(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">Shown on your profile so students can email you</p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={handleSkip} className="flex-1">
            Skip
          </Button>
          <Button onClick={handleSaveContact} disabled={savingContact} className="flex-1">
            {savingContact ? "Saving…" : "Save & Continue"}
          </Button>
        </div>
      </div>
    </div>
  )
}
