"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, CheckCircle, XCircle, ChevronDown, ChevronUp, Trash2, Shield } from "lucide-react"
import type { Experience } from "@/components/experience-list"
import { approveExperience, rejectExperience, getExperiences, deleteExperience } from "@/lib/data-utils"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

export default function AdminDashboard() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [pendingExperiences, setPendingExperiences] = useState<Experience[]>([])
  const [approvedExperiences, setApprovedExperiences] = useState<Experience[]>([])
  const [rejectedExperiences, setRejectedExperiences] = useState<Experience[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("pending")

  // Use refs to prevent memory leaks and cleanup issues
  const isMounted = useRef(true)

  // Memoize the loadExperiences function to prevent unnecessary re-renders
  const loadExperiences = useCallback(async () => {
    if (!isMounted.current) return

    try {
      const allExperiences = await getExperiences()

      if (!isMounted.current) return

      setPendingExperiences(allExperiences.filter((exp) => exp.status === "pending"))
      setApprovedExperiences(allExperiences.filter((exp) => exp.status === "approved"))
      setRejectedExperiences(allExperiences.filter((exp) => exp.status === "rejected"))
    } catch (error) {
      console.error("Error loading experiences:", error)
      if (isMounted.current) {
        toast({
          title: "Error",
          description: "Failed to load experiences. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    // Set isMounted to true when component mounts
    isMounted.current = true

    // Load experiences
    loadExperiences()

    // Cleanup function to prevent memory leaks and state updates after unmount
    return () => {
      isMounted.current = false
    }
  }, [loadExperiences])

  const handleApprove = async (id: number) => {
    if (!isMounted.current) return

    try {
      await approveExperience(id)

      if (!isMounted.current) return

      toast({
        title: "Success",
        description: "Experience approved successfully.",
      })
      loadExperiences()
    } catch (error) {
      console.error("Error approving experience:", error)

      if (isMounted.current) {
        toast({
          title: "Error",
          description: "Failed to approve experience. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleReject = async (id: number) => {
    if (!isMounted.current) return

    try {
      await rejectExperience(id)

      if (!isMounted.current) return

      toast({
        title: "Success",
        description: "Experience rejected successfully.",
      })
      loadExperiences()
    } catch (error) {
      console.error("Error rejecting experience:", error)

      if (isMounted.current) {
        toast({
          title: "Error",
          description: "Failed to reject experience. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleDelete = async (id: number) => {
    if (!isMounted.current) return

    // Confirm before deleting
    if (!window.confirm("Are you sure you want to delete this experience? This action cannot be undone.")) {
      return
    }

    try {
      await deleteExperience(id)

      if (!isMounted.current) return

      toast({
        title: "Success",
        description: "Experience deleted successfully.",
      })
      loadExperiences()
    } catch (error) {
      console.error("Error deleting experience:", error)

      if (isMounted.current) {
        toast({
          title: "Error",
          description: "Failed to delete experience. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleLogout = async () => {
    if (!isMounted.current) return

    try {
      await logout()
      router.push("/")
    } catch (error) {
      console.error("Error during logout:", error)

      if (isMounted.current) {
        toast({
          title: "Error",
          description: "Failed to logout. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  if (isLoading) {
    return (
      <div className="container py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-6">
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 lg:py-12">
      <div className="flex flex-col gap-4 sm:gap-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Admin Dashboard</h1>
              <p className="text-muted-foreground text-sm">
                Welcome back, {user?.displayName || user?.email?.split("@")[0]}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleLogout} className="text-xs sm:text-sm">
              Logout
            </Button>
          </div>
        </div>

        <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-amber-800 dark:text-amber-300">Admin Access</AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-400">
            You have administrator privileges. You can approve, reject, or delete experiences submitted by users.
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" className="text-xs sm:text-sm">
              Pending
              {pendingExperiences.length > 0 && (
                <Badge variant="secondary" className="ml-1 sm:ml-2 text-[10px] sm:text-xs">
                  {pendingExperiences.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved" className="text-xs sm:text-sm">
              Approved
            </TabsTrigger>
            <TabsTrigger value="rejected" className="text-xs sm:text-sm">
              Rejected
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-4 sm:mt-6">
            {pendingExperiences.length === 0 ? (
              <div className="text-center py-6 sm:py-8 md:py-12">
                <h3 className="text-base sm:text-lg font-medium">No pending experiences</h3>
                <p className="text-muted-foreground mt-2 text-sm">All submissions have been reviewed</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:gap-4 md:gap-6">
                {pendingExperiences.map((experience) => (
                  <ExperienceCard
                    key={experience.id}
                    experience={experience}
                    onApprove={() => handleApprove(experience.id)}
                    onReject={() => handleReject(experience.id)}
                    onDelete={() => handleDelete(experience.id)}
                    isPending={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="approved" className="mt-4 sm:mt-6">
            {approvedExperiences.length === 0 ? (
              <div className="text-center py-6 sm:py-8 md:py-12">
                <h3 className="text-base sm:text-lg font-medium">No approved experiences</h3>
                <p className="text-muted-foreground mt-2 text-sm">Approve pending submissions to see them here</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:gap-4 md:gap-6">
                {approvedExperiences.map((experience) => (
                  <ExperienceCard
                    key={experience.id}
                    experience={experience}
                    onDelete={() => handleDelete(experience.id)}
                    isPending={false}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rejected" className="mt-4 sm:mt-6">
            {rejectedExperiences.length === 0 ? (
              <div className="text-center py-6 sm:py-8 md:py-12">
                <h3 className="text-base sm:text-lg font-medium">No rejected experiences</h3>
                <p className="text-muted-foreground mt-2 text-sm">Rejected submissions will appear here</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:gap-4 md:gap-6">
                {rejectedExperiences.map((experience) => (
                  <ExperienceCard
                    key={experience.id}
                    experience={experience}
                    onDelete={() => handleDelete(experience.id)}
                    isPending={false}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

interface ExperienceCardProps {
  experience: Experience
  onApprove?: () => void
  onReject?: () => void
  onDelete?: () => void
  isPending: boolean
}

function ExperienceCard({ experience, onApprove, onReject, onDelete, isPending }: ExperienceCardProps) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
          <div>
            <CardTitle className="text-base sm:text-lg md:text-xl line-clamp-1">{experience.studentName}</CardTitle>
            <CardDescription className="text-xs sm:text-sm line-clamp-1">
              {experience.branch} • {experience.company} • {experience.year}
            </CardDescription>
          </div>

          {isPending ? (
            <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
              <Button
                variant="outline"
                size="sm"
                className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-1 sm:flex-none text-xs h-8"
                onClick={onReject}
              >
                <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span>Reject</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-green-500 hover:text-green-700 hover:bg-green-50 flex-1 sm:flex-none text-xs h-8"
                onClick={onApprove}
              >
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span>Approve</span>
              </Button>
              <Button variant="destructive" size="sm" className="flex-1 sm:flex-none text-xs h-8" onClick={onDelete}>
                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span>Delete</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Badge
                variant={experience.status === "approved" ? "success" : "destructive"}
                className="text-[10px] sm:text-xs"
              >
                {experience.status === "approved" ? "Approved" : "Rejected"}
              </Badge>
              <Button variant="destructive" size="sm" className="h-7 text-xs" onClick={onDelete}>
                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span>Delete</span>
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6 pt-0 sm:pt-0 md:pt-0">
        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-wrap gap-1 sm:gap-2">
            <Badge variant="outline" className="text-[10px] sm:text-xs">
              {experience.company}
            </Badge>
            <Badge variant="secondary" className="text-[10px] sm:text-xs">
              {experience.type}
            </Badge>
            <Badge variant="outline" className="text-[10px] sm:text-xs">
              {experience.year}
            </Badge>
            {experience.role && (
              <Badge variant="outline" className="text-[10px] sm:text-xs bg-primary/10">
                {experience.role}
              </Badge>
            )}
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 sm:line-clamp-3">{experience.excerpt}</p>

          <div className="pt-2">
            <Button
              variant="secondary"
              className="w-full flex items-center justify-center gap-1 text-xs sm:text-sm h-8 sm:h-9"
              onClick={() => setShowDetails(!showDetails)}
            >
              <span>{showDetails ? "Hide Details" : "View Full Experience"}</span>
              {showDetails ? (
                <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" />
              ) : (
                <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
              )}
            </Button>
          </div>

          {showDetails && (
            <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4 border-t pt-3 sm:pt-4">
              <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm sm:text-md font-semibold mb-1 sm:mb-2">Preparation Strategy</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {experience.preparationStrategy || "Not provided"}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm sm:text-md font-semibold mb-1 sm:mb-2">Interview Process</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {experience.interviewProcess || "Not provided"}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm sm:text-md font-semibold mb-1 sm:mb-2">Tips for Success</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{experience.tips || "Not provided"}</p>
                </div>

                <div>
                  <h3 className="text-sm sm:text-md font-semibold mb-1 sm:mb-2">Challenges Faced</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{experience.challenges || "Not provided"}</p>
                </div>
              </div>

              {(experience.linkedIn || experience.github || experience.personalEmail) && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm sm:text-md font-semibold mb-1 sm:mb-2">Contact Information</h3>
                    <div className="grid gap-1 sm:gap-2 sm:grid-cols-2">
                      {experience.linkedIn && (
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          LinkedIn: {experience.linkedIn}
                        </p>
                      )}
                      {experience.github && (
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">GitHub: {experience.github}</p>
                      )}
                      {experience.personalEmail && (
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          Email: {experience.personalEmail}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

