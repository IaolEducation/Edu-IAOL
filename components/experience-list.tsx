"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ArrowRight, Clock, Bookmark, BookmarkCheck } from "lucide-react"
import { getExperiences, getMockExperiences } from "@/lib/data-utils"
import { toast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/auth-context"
import { getCompanyLogo, getRandomProfileImage } from "@/lib/image-utils"
import { db } from "@/lib/firebase"
import { doc, setDoc, deleteDoc, getDocs, query, collection, where, serverTimestamp } from "firebase/firestore"
import { useRouter } from "next/navigation"

export type Experience = {
  id: number
  studentName: string
  branch: string
  company: string
  companyType?: string
  year: number
  type: string
  excerpt: string
  profileImage?: string
  companyLogo?: string
  status: "pending" | "approved" | "rejected"
  linkedIn?: string
  github?: string
  personalEmail?: string
  email?: string
  phoneNumber?: string
  rollNumber?: string
  preparationStrategy?: string
  interviewProcess?: string
  tips?: string
  challenges?: string
  resources?: Array<{ title: string; url: string }>
  role?: string
  submittedAt?: string
  package?: string
}


export default function ExperienceList() {
  const searchParams = useSearchParams()
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  const [displayedExperiences, setDisplayedExperiences] = useState<Experience[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [allExperiences, setAllExperiences] = useState<Experience[]>([])
  const [error, setError] = useState<string | null>(null)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [savingId, setSavingId] = useState<string | null>(null)

  // Load experiences on mount - directly fetch from Firebase
  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        setIsLoading(true)
        setError(null)
        console.log("ExperienceList: Fetching experiences...")

        // Get experiences from Firestore
        const experiences = await getExperiences()
        console.log(`ExperienceList: Fetched ${experiences.length} experiences`)

        if (experiences.length === 0) {
          console.log("No experiences found, fetching approved experiences as fallback")
          // Use approved experiences as fallback via getMockExperiences (which now fetches real data)
          const approvedExperiences = await getMockExperiences()
          setAllExperiences(approvedExperiences)
          setDisplayedExperiences(approvedExperiences)
        } else {
          // Store all experiences
          setAllExperiences(experiences)
          // Initially display all experiences
          setDisplayedExperiences(experiences)
        }
      } catch (error) {
        console.error("Error loading experiences:", error)
        setError("Failed to load experiences. Please try again.")
        toast({
          title: "Error",
          description: "Failed to load experiences. Please try again.",
          variant: "destructive",
        })

        // Use approved experiences as fallback
        try {
          const approvedExperiences = await getMockExperiences()
          setAllExperiences(approvedExperiences)
          setDisplayedExperiences(approvedExperiences)
        } catch (fallbackError) {
          console.error("Error loading fallback experiences:", fallbackError)
          // If all else fails, use empty array
          setAllExperiences([])
          setDisplayedExperiences([])
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchExperiences()
  }, []) // Empty dependency array - only run once on mount

  useEffect(() => {
    if (!user) return
    getDocs(query(collection(db, "saves"), where("userId", "==", user.uid), where("itemType", "==", "experience")))
      .then((snap) => setSavedIds(new Set(snap.docs.map((d) => d.data().itemId))))
      .catch(() => {})
  }, [user])

  const toggleSave = async (exp: Experience, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) { router.push("/auth/login"); return }
    const idStr = String(exp.id)
    setSavingId(idStr)
    try {
      const saveId = `${user.uid}_experience_${idStr}`
      if (savedIds.has(idStr)) {
        await deleteDoc(doc(db, "saves", saveId))
        setSavedIds((prev) => { const s = new Set(prev); s.delete(idStr); return s })
      } else {
        await setDoc(doc(db, "saves", saveId), {
          userId: user.uid, itemId: idStr, itemType: "experience",
          title: `${exp.company} — ${exp.studentName}`, meta: `${exp.type} · ${exp.year}`,
          savedAt: serverTimestamp(),
        })
        setSavedIds((prev) => new Set(prev).add(idStr))
      }
    } catch { /* silent */ }
    setSavingId(null)
  }

  // Update the filter effect to include company type
  useEffect(() => {
    if (isLoading || allExperiences.length === 0) return

    // Get search parameters
    const query = searchParams?.get("query")?.toLowerCase() || ""
    const branch = searchParams?.get("branch") || ""
    const company = searchParams?.get("company") || ""
    const year = searchParams?.get("year") || ""
    const type = searchParams?.get("type") || ""
    const companyType = searchParams?.get("companyType") || ""

    // Apply filters
    let filtered = [...allExperiences]

    // Filter by search query
    if (query) {
      filtered = filtered.filter(
        (exp) =>
          exp.studentName.toLowerCase().includes(query) ||
          exp.company.toLowerCase().includes(query) ||
          (exp.excerpt && exp.excerpt.toLowerCase().includes(query)),
      )
    }

    // Filter by branch
    if (branch && branch !== "all") {
      filtered = filtered.filter((exp) => exp.branch.toLowerCase().replace(/\s+/g, "-") === branch)
    }

    // Filter by company
    if (company && company !== "all") {
      filtered = filtered.filter((exp) => exp.company.toLowerCase().replace(/\s+/g, "-") === company)
    }

    // Filter by year
    if (year && year !== "all") {
      filtered = filtered.filter((exp) => exp.year.toString() === year)
    }

    // Filter by placement type
    if (type && type !== "all") {
      filtered = filtered.filter((exp) => exp.type.toLowerCase().replace(/\s+/g, "-") === type)
    }

    // Filter by company type
    if (companyType && companyType !== "all") {
      filtered = filtered.filter(
        (exp) => exp.companyType && exp.companyType.toLowerCase().replace(/\s+/g, "-") === companyType,
      )
    }

    // Filter experiences based on status
    // Show all approved experiences to everyone
    // Only show pending/rejected to admins or the owner
    filtered = filtered.filter((exp) => {
      if (exp.status === "approved") return true
      if (isAdmin) return true
      if (user && exp.uid === user.uid) return true
      return false
    })

    // Update displayed experiences
    setDisplayedExperiences(filtered)
  }, [searchParams, isLoading, allExperiences, isAdmin, user])

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="flex flex-col overflow-hidden">
            <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 sm:h-5 w-24 sm:w-32 mb-1" />
                    <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
                  </div>
                </div>
                <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-md" />
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-3 sm:p-4 pt-0 sm:pt-0">
              <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-3">
                <Skeleton className="h-4 sm:h-5 w-16 sm:w-20" />
                <Skeleton className="h-4 sm:h-5 w-20 sm:w-24" />
                <Skeleton className="h-4 sm:h-5 w-12 sm:w-16" />
              </div>
              <Skeleton className="h-3 sm:h-4 w-full mb-2" />
              <Skeleton className="h-3 sm:h-4 w-full mb-2" />
              <Skeleton className="h-3 sm:h-4 w-3/4" />
            </CardContent>
            <CardFooter className="p-3 sm:p-4">
              <Skeleton className="h-8 sm:h-9 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-red-600 dark:text-red-400 mb-2">Error Loading Experiences</h3>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    )
  }
  const CompanyLogo = getCompanyLogo()

  return (
    <div>
      {displayedExperiences.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <h3 className="text-base sm:text-lg font-medium">No experiences found</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">Try adjusting your filters or search criteria</p>
          <Button asChild className="mt-4">
            <Link href="/submit">Share Your Experience</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {displayedExperiences.map((experience) => (
            <Card key={experience.id} className="flex flex-col overflow-hidden">
              <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                      <AvatarImage src={experience.profileImage || getRandomProfileImage()} alt={experience.studentName} />
                      <AvatarFallback>{experience.studentName.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-sm sm:text-lg line-clamp-1">{experience.studentName}</CardTitle>
                      <CardDescription className="text-xs sm:text-sm line-clamp-1">{experience.branch}</CardDescription>
                    </div>
                  </div>
                  <Image
                    src={CompanyLogo || "/placeholder.svg"}
                    alt={`${experience.company} logo`}
                    width={32}
                    height={32}
                    className="rounded-md h-8 w-8 sm:h-10 sm:w-10 object-contain"
                  />
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-3 sm:p-4 pt-0 sm:pt-0">
                <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-3">
                  <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0 h-5">
                    {experience.company}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 py-0 h-5">
                    {experience.type}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0 h-5">
                    {experience.year}
                  </Badge>
                  {experience.companyType && (
                    <Badge
                      variant="outline"
                      className="text-[10px] sm:text-xs px-1.5 py-0 h-5 bg-blue-100 dark:bg-blue-900/30 nith-theme:bg-gold/20"
                    >
                      {getCompanyTypeName(experience.companyType)}
                    </Badge>
                  )}
                  {experience.role && (
                    <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0 h-5 bg-primary/10">
                      {experience.role}
                    </Badge>
                  )}
                  {experience.status === "pending" && (experience.uid === user?.uid || isAdmin) && (
                    <Badge
                      variant="outline"
                      className="text-[10px] sm:text-xs px-1.5 py-0 h-5 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 flex items-center gap-1"
                    >
                      <Clock className="h-3 w-3" />
                      <span>Pending</span>
                    </Badge>
                  )}
                  {experience.status === "rejected" && (experience.uid === user?.uid || isAdmin) && (
                    <Badge variant="destructive" className="text-[10px] sm:text-xs px-1.5 py-0 h-5">
                      Rejected
                    </Badge>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 sm:line-clamp-4">
                  {experience.excerpt}
                </p>
              </CardContent>
              <CardFooter className="p-3 sm:p-4 flex gap-2">
                <Button asChild variant="ghost" className="flex-1 h-8 sm:h-9 text-xs sm:text-sm">
                  <Link href={`/experiences/${experience.id}`} className="flex items-center justify-between">
                    <span>Read Full Experience</span>
                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost" size="icon"
                  className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 text-muted-foreground hover:text-primary"
                  disabled={savingId === String(experience.id)}
                  onClick={(e) => toggleSave(experience, e)}
                >
                  {savedIds.has(String(experience.id)) ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// Helper function to get company type name
function getCompanyTypeName(value: string): string {
  const typeMap: Record<string, string> = {
    tech: "Tech",
    finance: "Finance",
    core: "Core",
    product: "Product",
    service: "Service",
    consulting: "Consulting",
    ecommerce: "E-Commerce",
    healthcare: "Healthcare",
    manufacturing: "Manufacturing",
    other: "Other",
  }
  return typeMap[value] || value
}

