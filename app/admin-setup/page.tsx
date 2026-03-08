"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Shield, CheckCircle, Clock, RefreshCw } from "lucide-react"

interface AdminRequest {
  id: string
  userId: string
  userEmail: string
  userName: string
  status: "pending" | "approved" | "rejected"
  requestedAt: any
  approvedBy?: string
  approvedAt?: any
}

export default function AdminSetupPage() {
  const { user, loading, isAdmin } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null)
  const [existingRequest, setExistingRequest] = useState<AdminRequest | null>(null)
  const [isFirstUser, setIsFirstUser] = useState(false)
  const router = useRouter()

  // Update the useEffect to check only the current user's document
  useEffect(() => {
    async function checkUserStatus() {
      if (loading || !user) return

      try {
        // Check if user is already an admin
        if (isAdmin) {
          setMessage({
            type: "info",
            text: "You already have admin privileges.",
          })
          return
        }

        // Check the user's document
        const userRef = doc(db, "users", user.uid)
        const userDoc = await getDoc(userRef)

        if (userDoc.exists()) {
          const userData = userDoc.data()

          // Check for admin request
          if (userData.adminRequest) {
            const requestData = {
              id: user.uid,
              userId: user.uid,
              userEmail: user.email || "",
              userName: user.displayName || user.email?.split("@")[0] || "Unknown User",
              status: userData.adminRequest.status,
              requestedAt: userData.adminRequest.requestedAt,
            } as AdminRequest

            setExistingRequest(requestData)

            if (userData.adminRequest.status === "pending") {
              setMessage({
                type: "info",
                text: "Your admin request is pending approval.",
              })
            } else if (userData.adminRequest.status === "approved") {
              setMessage({
                type: "success",
                text: "Your admin request has been approved! Please refresh the page or log out and log back in to access the admin dashboard.",
              })
            } else if (userData.adminRequest.status === "rejected") {
              setMessage({
                type: "error",
                text: "Your admin request was rejected.",
              })
            }
          }
        }

        // Check for first user status using a special document
        const statsRef = doc(db, "stats", "admin")
        const statsDoc = await getDoc(statsRef)

        if (!statsDoc.exists() || !statsDoc.data().adminCount) {
          setIsFirstUser(true)
        }
      } catch (error) {
        console.error("Error checking user status:", error)
        // Don't show the error to the user, just log it
      }
    }

    checkUserStatus()
  }, [user, loading, isAdmin])

  const handleRequestAdminAccess = async () => {
    if (!user) {
      setMessage({
        type: "error",
        text: "You must be logged in to request admin access.",
      })
      return
    }

    try {
      setIsSubmitting(true)
      setMessage(null)

      // Store admin request in the user document with all required fields
      const userRef = doc(db, "users", user.uid)

      // Prepare the data to update/set
      const userData: any = {
        email: user.email,
        displayName: user.displayName || user.email?.split("@")[0],
        adminRequest: {
          status: "pending",
          requestedAt: serverTimestamp(),
        },
      }

      // If this is the first user, auto-approve
      if (isFirstUser) {
        // Make them an admin immediately
        userData.role = "admin"
        userData.adminRequest.status = "approved"
        userData.adminRequest.approvedAt = serverTimestamp()

        // Update the admin stats document
        const statsRef = doc(db, "stats", "admin")
        await setDoc(
          statsRef,
          {
            adminCount: 1,
            lastUpdated: serverTimestamp(),
          },
          { merge: true },
        )
      }

      // Use set with merge option
      await setDoc(userRef, userData, { merge: true })

      if (isFirstUser) {
        // Store admin info in localStorage for immediate effect
        localStorage.setItem(
          "currentAdmin",
          JSON.stringify({
            uid: user.uid,
            email: user.email,
            name: user.displayName || user.email?.split("@")[0] || "Admin User",
          }),
        )

        setMessage({
          type: "success",
          text: "You have been automatically promoted to admin as the first user! Please refresh the page or log out and log back in to access the admin dashboard.",
        })

        // Force a page reload after 3 seconds to refresh the auth state
        setTimeout(() => {
          window.location.href = "/admin"
        }, 3000)
      } else {
        setMessage({
          type: "success",
          text: "Your admin request has been submitted and is pending approval from an existing admin.",
        })
        setExistingRequest({
          id: user.uid,
          userId: user.uid,
          userEmail: user.email || "",
          userName: user.displayName || user.email?.split("@")[0] || "Unknown User",
          status: "pending",
          requestedAt: { toDate: () => new Date() } as any,
        })
      }
    } catch (error: any) {
      console.error("Error requesting admin access:", error)
      setMessage({
        type: "error",
        text: `Error: ${error.message || "Unknown error"}`,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Add a function to handle retrying a rejected admin request
  const handleRetryAdminRequest = async () => {
    if (!user) {
      setMessage({
        type: "error",
        text: "You must be logged in to request admin access.",
      })
      return
    }

    try {
      setIsSubmitting(true)
      setMessage(null)

      // Update the user document to change the admin request status to pending
      const userRef = doc(db, "users", user.uid)

      await setDoc(
        userRef,
        {
          adminRequest: {
            status: "pending",
            requestedAt: serverTimestamp(),
            // Clear any previous rejection data
            rejectedAt: null,
            rejectedBy: null,
            rejectionReason: null,
          },
        },
        { merge: true },
      )

      // Update the local state
      setMessage({
        type: "success",
        text: "Your admin request has been resubmitted and is pending approval.",
      })

      if (existingRequest) {
        setExistingRequest({
          ...existingRequest,
          status: "pending",
          requestedAt: { toDate: () => new Date() } as any,
        })
      }
    } catch (error: any) {
      console.error("Error retrying admin request:", error)
      setMessage({
        type: "error",
        text: `Error: ${error.message || "Unknown error"}`,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-8 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            You need to be logged in to request admin access.
            <div className="mt-4">
              <Button asChild size="sm">
                <a href="/auth/login">Login</a>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <CardTitle>Admin Access Request</CardTitle>
            </div>
            <CardDescription>Request admin access for the placement portal</CardDescription>
          </CardHeader>
          <CardContent>
            {isAdmin ? (
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-center">You already have admin privileges. You can access the admin dashboard.</p>
                <Button onClick={() => router.push("/admin")} className="mt-2">
                  Go to Admin Dashboard
                </Button>
              </div>
            ) : existingRequest ? (
              <div className="flex flex-col items-center gap-4 py-4">
                {existingRequest.status === "pending" ? (
                  <>
                    <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900">
                      <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                    </div>
                    <p className="text-center">
                      Your admin request is pending approval from an existing admin. You'll be notified once your
                      request is processed.
                    </p>
                  </>
                ) : existingRequest.status === "approved" ? (
                  <>
                    <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                      <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-center">
                      Your admin request has been approved! Please refresh the page or log out and log back in to access
                      the admin dashboard.
                    </p>
                    <Button onClick={() => (window.location.href = "/admin")} className="mt-2">
                      Go to Admin Dashboard
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="p-3 rounded-full bg-red-100 dark:bg-red-900">
                      <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                    </div>
                    <p className="text-center mb-4">
                      Your admin request was rejected. If you believe this was a mistake, you can try again.
                    </p>
                    <Button
                      onClick={handleRetryAdminRequest}
                      disabled={isSubmitting}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      {isSubmitting ? "Submitting..." : "Retry Request"}
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  You are about to request admin access for your account ({user?.email}). Admin privileges will allow
                  you to manage experiences, approve submissions, and more.
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  {isFirstUser
                    ? "Since you are the first user requesting admin access, your request will be automatically approved."
                    : "Your request will need to be approved by an existing admin before you gain admin privileges."}
                </p>
              </>
            )}

            {message && (
              <Alert
                variant={message.type === "success" ? "default" : message.type === "error" ? "destructive" : "default"}
                className="mb-4"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>
                  {message.type === "success" ? "Success" : message.type === "error" ? "Error" : "Information"}
                </AlertTitle>
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            {!isAdmin && !existingRequest && (
              <Button onClick={handleRequestAdminAccess} disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Submitting..." : "Request Admin Access"}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

