"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Calendar,
  Building,
  Briefcase,
  Linkedin,
  Github,
  Mail,
  Award,
  ExternalLink,
  Lock,
  Clock,
  Shield,
  XCircle,
} from "lucide-react"
import { getExperiences } from "@/lib/data-utils"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { toast } from "@/hooks/use-toast"
import type { Experience } from "@/components/experience-list"
import { useAuth } from "@/contexts/auth-context"
import { getCompanyLogo, getRandomProfileImage } from "@/lib/image-utils"

// Function to get the company type name
const getCompanyTypeName = (companyType: string) => {
  switch (companyType) {
    case "product":
      return "Product Based"
    case "service":
      return "Service Based"
    case "consulting":
      return "Consulting"
    case "mixed":
      return "Mixed"
    default:
      return companyType.charAt(0).toUpperCase() + companyType.slice(1)
  }
}

export default function ExperiencePage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAdmin, isAuthenticated } = useAuth()
  const [experience, setExperience] = useState<Experience | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [relatedExperiences, setRelatedExperiences] = useState<Experience[]>([])
  const [requiresAuth, setRequiresAuth] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  useEffect(() => {
    const loadExperience = async () => {
      try {
        const docId = params.id as string

        // Fetch directly from Firestore by document ID
        const snap = await getDoc(doc(db, "experiences", docId))

        if (!snap.exists()) {
          toast({ title: "Experience not found", description: "This experience doesn't exist or has been removed.", variant: "destructive" })
          router.push("/experiences")
          return
        }

        const data = snap.data()
        const foundExperience: Experience = {
          id: snap.id as unknown as number,
          studentName: data.studentName || "Anonymous",
          branch: data.branch || "Unknown",
          company: data.company || "Unknown",
          companyType: data.companyType,
          year: data.year || new Date().getFullYear(),
          type: data.type || "Unknown",
          excerpt: data.excerpt || data.interviewProcess?.substring(0, 150) || "No details provided",
          profileImage: data.profileImage || "/placeholder.svg?height=100&width=100",
          companyLogo: data.companyLogo || "/placeholder.svg?height=40&width=40",
          status: data.status || "approved",
          linkedIn: data.linkedIn,
          github: data.github,
          personalEmail: data.personalEmail,
          preparationStrategy: data.preparationStrategy,
          interviewProcess: data.interviewProcess,
          tips: data.tips,
          challenges: data.challenges,
          resources: data.resources,
          role: data.role,
          submittedAt: data.submittedAt,
          package: data.package,
          uid: data.uid,
        }

        // Access control
        if (!isAdmin && !isAuthenticated && foundExperience.status !== "approved") {
          setRequiresAuth(true)
          setShowLoginPrompt(true)
          setExperience(foundExperience)
        } else if (!isAdmin && isAuthenticated && foundExperience.status !== "approved" && foundExperience.uid !== user?.uid) {
          setRequiresAuth(true)
          setExperience(foundExperience)
        } else {
          setExperience(foundExperience)

          // Load related experiences (same company or student)
          try {
            const allExps = await getExperiences()
            const related = allExps
              .filter((exp) => String(exp.id) !== docId && exp.status === "approved" &&
                (exp.company === foundExperience.company || exp.studentName === foundExperience.studentName))
              .slice(0, 3)
            setRelatedExperiences(related)
          } catch { /* related is optional */ }
        }
      } catch (error) {
        console.error("Error loading experience:", error)
        toast({ title: "Error", description: "Failed to load experience details. Please try again.", variant: "destructive" })
        router.push("/experiences")
      } finally {
        setIsLoading(false)
      }
    }

    loadExperience()
  }, [params.id, router, user, isAdmin, isAuthenticated])

  const handleLoginRedirect = () => {
    router.push(`/auth/login?redirectTo=/experiences/${params.id}`)
  }

  if (isLoading) {
    return (
      <div className="container px-4 md:px-6 py-8 md:py-12">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  if (!experience) {
    return (
      <div className="container px-4 md:px-6 py-8 md:py-12">
        <p>Experience not found</p>
      </div>
    )
  }

  // Show authentication required message
  if (requiresAuth && showLoginPrompt) {
    return (
      <div className="container px-4 md:px-6 py-8 md:py-12">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/experiences" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Experiences
          </Link>
        </Button>

        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-muted p-8 rounded-lg flex flex-col items-center gap-4">
            <Lock className="h-12 w-12 text-primary" />
            <h1 className="text-2xl font-bold">Authentication Required</h1>
            <p className="text-muted-foreground mb-4">
              This experience is only available to authenticated NIT Hamirpur students. Please login with your NITH
              email to view this content.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild variant="outline">
                <Link href="/experiences">Browse Public Experiences</Link>
              </Button>
              <Button onClick={handleLoginRedirect}>Login to View</Button>
            </div>
          </div>
        </div>
      </div>
    )
  }
const profilePicture = experience.profileImage || getRandomProfileImage()
const CompanyLogo = getCompanyLogo()
  return (
    <div className="container px-4 md:px-6 py-8 md:py-12">
      <Button asChild variant="ghost" className="mb-6">
        <Link href="/experiences" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Experiences
        </Link>
      </Button>

      {experience.status === "pending" && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <div>
              <p className="font-medium">This experience is pending approval</p>
              {isAdmin ? (
                <p className="text-sm">
                  As an admin, you can review and approve this submission in the admin dashboard.
                </p>
              ) : (
                <p className="text-sm">Your submission is being reviewed by an admin and will be published soon.</p>
              )}
            </div>
          </div>
          {isAdmin && (
            <div className="mt-3">
              <Button asChild size="sm" variant="outline" className="bg-white/50 dark:bg-black/20">
                <Link href="/admin" className="flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5 mr-1" />
                  <span>Go to Admin Dashboard</span>
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}

      {experience.status === "rejected" && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            <div>
              <p className="font-medium">This experience has been rejected</p>
              {isAdmin ? (
                <p className="text-sm">As an admin, you can review this submission in the admin dashboard.</p>
              ) : (
                <p className="text-sm">
                  Your submission was reviewed but not approved for publication. You may submit a new experience.
                </p>
              )}
            </div>
          </div>
          {isAdmin && (
            <div className="mt-3">
              <Button asChild size="sm" variant="outline" className="bg-white/50 dark:bg-black/20">
                <Link href="/admin" className="flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5 mr-1" />
                  <span>Go to Admin Dashboard</span>
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="space-y-8">
          {/* Header with student info */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profilePicture} alt={experience.studentName} />
                <AvatarFallback>{experience.studentName.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold md:text-3xl">{experience.studentName}</h1>
                <p className="text-muted-foreground">{experience.branch}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-sm">
                {experience.company}
              </Badge>
              <Badge variant="secondary" className="text-sm">
                {experience.type}
              </Badge>
              <Badge variant="outline" className="text-sm">
                {experience.year}
              </Badge>
              {experience.companyType && (
                <Badge variant="outline" className="text-sm bg-blue-100 dark:bg-blue-900/30 nith-theme:bg-gold/20">
                  {getCompanyTypeName(experience.companyType)}
                </Badge>
              )}
              {experience.role && (
                <Badge variant="outline" className="text-sm bg-primary/10">
                  {experience.role}
                </Badge>
              )}
              {experience.status === "pending" && (
                <Badge
                  variant="outline"
                  className="text-sm bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 flex items-center gap-1"
                >
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  <span>Pending</span>
                </Badge>
              )}
              {experience.status === "rejected" && (
                <Badge variant="destructive" className="text-sm">
                  Rejected
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* Full Experience Content */}
          <div className="space-y-8">
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <h2 className="text-xl font-semibold mb-4">Preparation Strategy</h2>
              <div className="bg-muted/50 p-6 rounded-lg">
                <p className="whitespace-pre-line">
                  {experience.preparationStrategy || "No preparation details provided."}
                </p>
              </div>
            </div>

            <div className="prose prose-gray dark:prose-invert max-w-none">
              <h2 className="text-xl font-semibold mb-4">Interview Process</h2>
              <div className="bg-muted/50 p-6 rounded-lg">
                <p className="whitespace-pre-line">{experience.interviewProcess || "No interview details provided."}</p>
              </div>
            </div>

            <div className="prose prose-gray dark:prose-invert max-w-none">
              <h2 className="text-xl font-semibold mb-4">Tips for Success</h2>
              <div className="bg-muted/50 p-6 rounded-lg">
                <p className="whitespace-pre-line">{experience.tips || "No tips provided."}</p>
              </div>
            </div>

            <div className="prose prose-gray dark:prose-invert max-w-none">
              <h2 className="text-xl font-semibold mb-4">Challenges Faced</h2>
              <div className="bg-muted/50 p-6 rounded-lg">
                <p className="whitespace-pre-line">{experience.challenges || "No challenges provided."}</p>
              </div>
            </div>

            {experience.resources && experience.resources.length > 0 && (
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <h2 className="text-xl font-semibold mb-4">Helpful Resources</h2>
                <div className="bg-muted/50 p-6 rounded-lg">
                  <ul className="space-y-2">
                    {experience.resources.map((resource, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4 text-primary shrink-0" />
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {resource.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Company Card */}
          <Card className="p-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <Image
                src={CompanyLogo || "/placeholder.svg"}
                alt={`${experience.company} logo`}
                width={80}
                height={80}
                className="rounded-md"
              />
              <h2 className="text-xl font-semibold">{experience.company}</h2>
              <Separator />
              <div className="grid w-full gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span>Placement Type:</span>
                  <span className="ml-auto font-medium">{experience.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Year:</span>
                  <span className="ml-auto font-medium">{experience.year}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>Role:</span>
                  <span className="ml-auto font-medium">{experience.role || "Software Engineer"}</span>
                </div>
                {experience.package && (
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span>Package:</span>
                    <span className="ml-auto font-medium">{experience.package}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Contact Card */}
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold">Connect with {experience.studentName.split(" ")[0]}</h3>
            <div className="space-y-4">
              {experience.linkedIn && (
                <div className="flex items-center gap-3">
                  <Linkedin className="h-5 w-5 text-blue-600" />
                  <div>
                    <h4 className="text-sm font-medium">LinkedIn</h4>
                    <a
                      href={
                        experience.linkedIn.startsWith("http") ? experience.linkedIn : `https://${experience.linkedIn}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      Connect on LinkedIn
                    </a>
                  </div>
                </div>
              )}

              {experience.github && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <Github className="h-5 w-5 text-gray-800 dark:text-gray-200" />
                    <div>
                      <h4 className="text-sm font-medium">GitHub</h4>
                      <a
                        href={
                          experience.github.startsWith("http")
                            ? experience.github
                            : `https://github.com/${experience.github}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        View GitHub Profile
                      </a>
                    </div>
                  </div>
                </>
              )}

              {experience.personalEmail && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-red-500" />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">Email</h4>
                      <a href={`mailto:${experience.personalEmail}`} className="text-xs text-muted-foreground hover:underline">
                        {experience.personalEmail}
                      </a>
                      <div className="mt-2">
                        <a
                          href={`mailto:${experience.personalEmail}?subject=Query about your ${experience.company} placement experience&body=Hi ${experience.studentName.split(" ")[0]},%0D%0A%0D%0AI came across your ${experience.company} placement experience on Eduiaol and had a query:%0D%0A%0D%0A`}
                          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                          <Mail className="h-3.5 w-3.5" /> Send Query
                        </a>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {!experience.linkedIn && !experience.github && !experience.personalEmail && (
                <p className="text-sm text-muted-foreground text-center">No contact information provided</p>
              )}
            </div>
          </Card>

          {/* Related Experiences Card */}
          {relatedExperiences.length > 0 && (
            <Card className="p-6">
              <h3 className="mb-4 text-lg font-semibold">Related Experiences</h3>
              <div className="space-y-4">
                {relatedExperiences.map((relatedExp) => (
                  <div key={relatedExp.id}>
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={relatedExp.profileImage || profilePicture} alt={relatedExp.studentName} />
                        <AvatarFallback>{relatedExp.studentName.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">{relatedExp.studentName}</h4>
                        <p className="text-xs text-muted-foreground">
                          {relatedExp.company}, {relatedExp.year}
                        </p>
                        <Link href={`/experiences/${relatedExp.id}`} className="text-xs text-primary hover:underline">
                          Read Experience
                        </Link>
                      </div>
                    </div>
                    {relatedExperiences.indexOf(relatedExp) < relatedExperiences.length - 1 && (
                      <Separator className="my-4" />
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

