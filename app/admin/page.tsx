"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  CheckCircle,
  XCircle,
  Trash2,
  Shield,
  Clock,
  Calendar,
  Briefcase,
  User,
  BookOpen,
  Award,
  UserPlus,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  type Timestamp,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import Link from "next/link"
import Image from "next/image"

// Experience type definition
interface Experience {
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
  submittedAt?: Timestamp | string
  package?: string
  uid?: string
}

// Admin Request type definition
interface AdminRequest {
  id: string
  userId: string
  userEmail: string
  userName: string
  status: "pending" | "approved" | "rejected"
  requestedAt: Timestamp
  approvedBy?: string
  approvedAt?: Timestamp
}

// Helper function to format Firebase timestamp
function formatTimestamp(timestamp: Timestamp | string | undefined): string {
  if (!timestamp) return "Unknown date"

  if (typeof timestamp === "string") {
    return timestamp
  }

  try {
    // Convert Firebase timestamp to JS Date
    const date = timestamp.toDate()
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch (error) {
    console.error("Error formatting timestamp:", error)
    return "Invalid date"
  }
}

export default function AdminPage() {
  const router = useRouter()
  const { user, isAdmin, logout, loading } = useAuth()
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [adminRequests, setAdminRequests] = useState<AdminRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("pending")
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    async function fetchData() {
      if (loading) return
      if (!isAdmin) {
        router.push("/unauthorized")
        return
      }

      try {
        setIsLoading(true)

        // Fetch experiences
        const experiencesCollection = collection(db, "experiences")
        const experiencesSnapshot = await getDocs(experiencesCollection)
        const experiencesList = experiencesSnapshot.docs.map((doc) => ({
          ...doc.data(),
          firestoreId: doc.id, // Store the Firestore document ID
        })) as Experience[]

        setExperiences(experiencesList)

        // Fetch admin requests from users collection
        const usersRef = collection(db, "users")
        const requestsQuery = query(usersRef, where("adminRequest.status", "==", "pending"))
        const requestsSnapshot = await getDocs(requestsQuery)
        const requestsList = requestsSnapshot.docs.map((doc) => {
          const userData = doc.data()
          return {
            id: doc.id,
            userId: doc.id,
            userEmail: userData.email || "",
            userName: userData.displayName || userData.email?.split("@")[0] || "Unknown User",
            status: userData.adminRequest.status,
            requestedAt: userData.adminRequest.requestedAt,
          }
        }) as AdminRequest[]

        setAdminRequests(requestsList)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [loading, isAdmin, router])

  const handleApprove = async (id: number) => {
    try {
      // Find the experience in Firestore
      const experiencesRef = collection(db, "experiences")
      const q = query(experiencesRef, where("id", "==", id))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const experienceDoc = querySnapshot.docs[0]
        await updateDoc(doc(db, "experiences", experienceDoc.id), {
          status: "approved",
        })

        // Update local state
        setExperiences((prev) => prev.map((exp) => (exp.id === id ? { ...exp, status: "approved" } : exp)))

        toast({
          title: "Success",
          description: "Experience approved successfully.",
        })
      }
    } catch (error) {
      console.error("Error approving experience:", error)
      toast({
        title: "Error",
        description: "Failed to approve experience. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleReject = async (id: number) => {
    try {
      // Find the experience in Firestore
      const experiencesRef = collection(db, "experiences")
      const q = query(experiencesRef, where("id", "==", id))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const experienceDoc = querySnapshot.docs[0]
        await updateDoc(doc(db, "experiences", experienceDoc.id), {
          status: "rejected",
        })

        // Update local state
        setExperiences((prev) => prev.map((exp) => (exp.id === id ? { ...exp, status: "rejected" } : exp)))

        toast({
          title: "Success",
          description: "Experience rejected successfully.",
        })
      }
    } catch (error) {
      console.error("Error rejecting experience:", error)
      toast({
        title: "Error",
        description: "Failed to reject experience. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this experience? This action cannot be undone.")) {
      return
    }

    try {
      // Find the experience in Firestore
      const experiencesRef = collection(db, "experiences")
      const q = query(experiencesRef, where("id", "==", id))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const experienceDoc = querySnapshot.docs[0]
        await deleteDoc(doc(db, "experiences", experienceDoc.id))

        // Update local state
        setExperiences((prev) => prev.filter((exp) => exp.id !== id))

        toast({
          title: "Success",
          description: "Experience deleted successfully.",
        })
      }
    } catch (error) {
      console.error("Error deleting experience:", error)
      toast({
        title: "Error",
        description: "Failed to delete experience. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleApproveAdminRequest = async (requestId: string, userId: string) => {
    try {
      // Update the user document
      const userRef = doc(db, "users", userId)
      await updateDoc(userRef, {
        role: "admin",
        "adminRequest.status": "approved",
        "adminRequest.approvedBy": user?.uid,
        "adminRequest.approvedAt": serverTimestamp(),
      })

      // Update local state
      setAdminRequests((prev) =>
        prev.map((req) =>
          req.id === requestId
            ? {
                ...req,
                status: "approved",
                approvedBy: user?.uid || "",
                approvedAt: { toDate: () => new Date() } as Timestamp,
              }
            : req,
        ),
      )

      toast({
        title: "Success",
        description: "Admin request approved successfully.",
      })
    } catch (error) {
      console.error("Error approving admin request:", error)
      toast({
        title: "Error",
        description: "Failed to approve admin request. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleRejectAdminRequest = async (requestId: string) => {
    try {
      // Update the user document
      const userRef = doc(db, "users", requestId)
      await updateDoc(userRef, {
        "adminRequest.status": "rejected",
        "adminRequest.approvedBy": user?.uid,
        "adminRequest.approvedAt": serverTimestamp(),
      })

      // Update local state
      setAdminRequests((prev) =>
        prev.map((req) =>
          req.id === requestId
            ? {
                ...req,
                status: "rejected",
                approvedBy: user?.uid || "",
                approvedAt: { toDate: () => new Date() } as Timestamp,
              }
            : req,
        ),
      )

      toast({
        title: "Success",
        description: "Admin request rejected successfully.",
      })
    } catch (error) {
      console.error("Error rejecting admin request:", error)
      toast({
        title: "Error",
        description: "Failed to reject admin request. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/")
    } catch (error) {
      console.error("Error during logout:", error)
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      })
    }
  }

  const openExperienceDetails = (experience: Experience) => {
    setSelectedExperience(experience)
    setIsDialogOpen(true)
  }

  if (loading || isLoading) {
    return (
      <div className="container py-10 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Access Denied</CardTitle>
            <CardDescription>You don't have permission to access this page</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This area is restricted to administrators only. If you believe you should have access, please contact the
              site administrator.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const pendingExperiences = experiences.filter((exp) => exp.status === "pending")
  const approvedExperiences = experiences.filter((exp) => exp.status === "approved")
  const rejectedExperiences = experiences.filter((exp) => exp.status === "rejected")
  const pendingAdminRequests = adminRequests.filter((req) => req.status === "pending")

  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage placement experiences and submissions</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Pending</CardTitle>
            <CardDescription>Experiences awaiting review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <div className="text-4xl font-bold text-amber-500">{pendingExperiences.length}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Approved</CardTitle>
            <CardDescription>Published experiences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <div className="text-4xl font-bold text-green-500">{approvedExperiences.length}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Rejected</CardTitle>
            <CardDescription>Declined experiences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <div className="text-4xl font-bold text-red-500">{rejectedExperiences.length}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Admin Requests</CardTitle>
            <CardDescription>Pending admin approvals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <div className="text-4xl font-bold text-blue-500">{pendingAdminRequests.length}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="pending" className="relative">
            Pending
            {pendingExperiences.length > 0 && (
              <Badge variant="secondary" className="ml-2 absolute -top-2 -right-2">
                {pendingExperiences.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="admin-requests" className="relative">
            Admin Requests
            {pendingAdminRequests.length > 0 && (
              <Badge variant="secondary" className="ml-2 absolute -top-2 -right-2">
                {pendingAdminRequests.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {pendingExperiences.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Pending Experiences</CardTitle>
                <CardDescription>All submissions have been reviewed</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  There are no pending experiences to review at this time. Check back later for new submissions.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingExperiences.map((experience) => (
                <ExperienceCard
                  key={experience.id}
                  experience={experience}
                  onApprove={() => handleApprove(experience.id)}
                  onReject={() => handleReject(experience.id)}
                  onDelete={() => handleDelete(experience.id)}
                  onViewDetails={() => openExperienceDetails(experience)}
                  isPending={true}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved">
          {approvedExperiences.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Approved Experiences</CardTitle>
                <CardDescription>No experiences have been approved yet</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  There are no approved experiences at this time. Approve pending submissions to see them here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {approvedExperiences.map((experience) => (
                <ExperienceCard
                  key={experience.id}
                  experience={experience}
                  onReject={() => handleReject(experience.id)}
                  onDelete={() => handleDelete(experience.id)}
                  onViewDetails={() => openExperienceDetails(experience)}
                  isPending={false}
                  isApproved={true}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected">
          {rejectedExperiences.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Rejected Experiences</CardTitle>
                <CardDescription>No experiences have been rejected</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">There are no rejected experiences at this time.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {rejectedExperiences.map((experience) => (
                <ExperienceCard
                  key={experience.id}
                  experience={experience}
                  onApprove={() => handleApprove(experience.id)}
                  onDelete={() => handleDelete(experience.id)}
                  onViewDetails={() => openExperienceDetails(experience)}
                  isPending={false}
                  isRejected={true}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="admin-requests">
          {pendingAdminRequests.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Pending Admin Requests</CardTitle>
                <CardDescription>No users are requesting admin access</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  There are no pending admin requests at this time. Check back later for new requests.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingAdminRequests.map((request) => (
                <AdminRequestCard
                  key={request.id}
                  request={request}
                  onApprove={() => handleApproveAdminRequest(request.id, request.userId)}
                  onReject={() => handleRejectAdminRequest(request.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedExperience && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Experience Details</DialogTitle>
              <DialogDescription>
                Submitted by {selectedExperience.studentName} on {formatTimestamp(selectedExperience.submittedAt)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="flex-shrink-0">
                  {selectedExperience.profileImage ? (
                    <Image
                      src={selectedExperience.profileImage || "/placeholder.svg"}
                      alt={selectedExperience.studentName}
                      width={80}
                      height={80}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{selectedExperience.studentName}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {selectedExperience.branch}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {selectedExperience.year}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      {selectedExperience.company}
                    </Badge>
                    {selectedExperience.role && (
                      <Badge variant="outline" className="flex items-center gap-1 bg-primary/10">
                        <Award className="h-3 w-3" />
                        {selectedExperience.role}
                      </Badge>
                    )}
                    <Badge
                      variant={
                        selectedExperience.status === "approved"
                          ? "success"
                          : selectedExperience.status === "rejected"
                            ? "destructive"
                            : "outline"
                      }
                      className="flex items-center gap-1"
                    >
                      {selectedExperience.status === "approved" ? (
                        <>
                          <CheckCircle className="h-3 w-3" /> Approved
                        </>
                      ) : selectedExperience.status === "rejected" ? (
                        <>
                          <XCircle className="h-3 w-3" /> Rejected
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3" /> Pending
                        </>
                      )}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Experience Summary</h4>
                <p className="text-muted-foreground">{selectedExperience.excerpt}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Preparation Strategy</h4>
                  <p className="text-muted-foreground">{selectedExperience.preparationStrategy || "Not provided"}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Interview Process</h4>
                  <p className="text-muted-foreground">{selectedExperience.interviewProcess || "Not provided"}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Tips for Success</h4>
                  <p className="text-muted-foreground">{selectedExperience.tips || "Not provided"}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Challenges Faced</h4>
                  <p className="text-muted-foreground">{selectedExperience.challenges || "Not provided"}</p>
                </div>
              </div>

              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Contact Information (Admin Only)</h4>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Email:</span> {selectedExperience.email || "Not provided"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Phone:</span> {selectedExperience.phoneNumber || "Not provided"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Roll Number:</span>{" "}
                      {selectedExperience.rollNumber || "Not provided"}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Social Profiles</h4>
                  <div className="space-y-1">
                    {selectedExperience.linkedIn && (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">LinkedIn:</span> {selectedExperience.linkedIn}
                      </p>
                    )}
                    {selectedExperience.github && (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">GitHub:</span> {selectedExperience.github}
                      </p>
                    )}
                    {selectedExperience.personalEmail && (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Personal Email:</span> {selectedExperience.personalEmail}
                      </p>
                    )}
                    {!selectedExperience.linkedIn &&
                      !selectedExperience.github &&
                      !selectedExperience.personalEmail && (
                        <p className="text-sm text-muted-foreground">No social profiles provided</p>
                      )}
                  </div>
                </div>
              </div>

              {(selectedExperience.linkedIn || selectedExperience.github || selectedExperience.personalEmail) && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Contact Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {selectedExperience.linkedIn && (
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">LinkedIn:</span> {selectedExperience.linkedIn}
                        </p>
                      )}
                      {selectedExperience.github && (
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">GitHub:</span> {selectedExperience.github}
                        </p>
                      )}
                      {selectedExperience.personalEmail && (
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Email:</span> {selectedExperience.personalEmail}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}

              <div className="flex flex-wrap gap-2 justify-end mt-4">
                {selectedExperience.status === "pending" && (
                  <>
                    <Button
                      variant="outline"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        handleReject(selectedExperience.id)
                        setIsDialogOpen(false)
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      variant="outline"
                      className="text-green-500 hover:text-green-700 hover:bg-green-50"
                      onClick={() => {
                        handleApprove(selectedExperience.id)
                        setIsDialogOpen(false)
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  </>
                )}
                {selectedExperience.status === "approved" && (
                  <Button
                    variant="outline"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      handleReject(selectedExperience.id)
                      setIsDialogOpen(false)
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                )}
                {selectedExperience.status === "rejected" && (
                  <Button
                    variant="outline"
                    className="text-green-500 hover:text-green-700 hover:bg-green-50"
                    onClick={() => {
                      handleApprove(selectedExperience.id)
                      setIsDialogOpen(false)
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this experience? This action cannot be undone.")) {
                      handleDelete(selectedExperience.id)
                      setIsDialogOpen(false)
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

interface ExperienceCardProps {
  experience: Experience
  onApprove?: () => void
  onReject?: () => void
  onDelete?: () => void
  onViewDetails: () => void
  isPending: boolean
  isApproved?: boolean
  isRejected?: boolean
}

function ExperienceCard({
  experience,
  onApprove,
  onReject,
  onDelete,
  onViewDetails,
  isPending,
  isApproved,
  isRejected,
}: ExperienceCardProps) {
  return (
    <Card className="overflow-hidden bg-secondary">
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg line-clamp-1">{experience.studentName}</CardTitle>
            <CardDescription className="line-clamp-1">
              {experience.company} - {experience.role || "Not specified"}
            </CardDescription>
          </div>
          {experience.companyLogo && (
            <Image
              src={experience.companyLogo || "/placeholder.svg"}
              alt={`${experience.company} logo`}
              width={40}
              height={40}
              className="rounded-md object-contain"
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="secondary" className="text-xs">
            {experience.branch}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {experience.year}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {experience.type}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{experience.excerpt}</p>
        <div className="flex flex-wrap gap-2">
          {isPending && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-1"
                onClick={onReject}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-green-500 hover:text-green-700 hover:bg-green-50 flex-1"
                onClick={onApprove}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </Button>
            </>
          )}
          {isApproved && (
            <Button
              size="sm"
              variant="outline"
              className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-1"
              onClick={onReject}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Reject
            </Button>
          )}
          {isRejected && (
            <Button
              size="sm"
              variant="outline"
              className="text-green-500 hover:text-green-700 hover:bg-green-50 flex-1"
              onClick={onApprove}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Approve
            </Button>
          )}
          <Button size="sm" variant="destructive" className="flex-none" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button variant="link" className="w-full p-0 h-auto text-primary" onClick={onViewDetails}>
          View Full Details
        </Button>
      </CardFooter>
    </Card>
  )
}

interface AdminRequestCardProps {
  request: AdminRequest
  onApprove: () => void
  onReject: () => void
}

function AdminRequestCard({ request, onApprove, onReject }: AdminRequestCardProps) {
  return (
    <Card className="overflow-hidden border-blue-200 dark:border-blue-800">
      <CardHeader className="p-4 bg-blue-50 dark:bg-blue-950">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg line-clamp-1">{request.userName}</CardTitle>
            <CardDescription className="line-clamp-1">{request.userEmail}</CardDescription>
          </div>
          <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
            <UserPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Requested on {formatTimestamp(request.requestedAt)}</span>
        </div>
        <p className="text-sm mb-4">
          This user is requesting admin privileges to manage experiences and approve submissions.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-1"
            onClick={onReject}
          >
            <XCircle className="h-4 w-4 mr-1" />
            Reject
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-green-500 hover:text-green-700 hover:bg-green-50 flex-1"
            onClick={onApprove}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Approve
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

