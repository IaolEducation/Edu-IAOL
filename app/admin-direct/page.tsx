"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Shield } from "lucide-react"

export default function AdminDirectPage() {
  const { user, loading } = useAuth()
  const [isCreating, setIsCreating] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [userId, setUserId] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [userName, setUserName] = useState("")

  // Auto-fill with current user info if available
  useEffect(() => {
    if (user) {
      setUserId(user.uid)
      setUserEmail(user.email || "")
      setUserName(user.displayName || user.email?.split("@")[0] || "")
    }
  }, [user])

  const handleCreateAdmin = async () => {
    if (!userId || !userEmail) {
      setMessage({
        type: "error",
        text: "User ID and email are required.",
      })
      return
    }

    try {
      setIsCreating(true)
      setMessage(null)

      // Create or update the user document with admin role
      const userRef = doc(db, "users", userId)
      await setDoc(
        userRef,
        {
          email: userEmail,
          displayName: userName || userEmail.split("@")[0],
          role: "admin",
          createdAt: serverTimestamp(),
        },
        { merge: true },
      ) // Use merge to update existing document if it exists

      setMessage({
        type: "success",
        text: "Admin user created successfully! Please log out and log back in to access the admin dashboard.",
      })
    } catch (error: any) {
      console.error("Error creating admin:", error)
      setMessage({
        type: "error",
        text: `Error: ${error.message || "Unknown error"}`,
      })
    } finally {
      setIsCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-8 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
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
              <CardTitle>Direct Admin Creation</CardTitle>
            </div>
            <CardDescription>Directly create an admin user in Firestore</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="userId" className="text-sm font-medium">
                  User ID (Firebase UID)
                </label>
                <input
                  id="userId"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Firebase User ID"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="userEmail" className="text-sm font-medium">
                  User Email
                </label>
                <input
                  id="userEmail"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="user@example.com"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="userName" className="text-sm font-medium">
                  Display Name (optional)
                </label>
                <input
                  id="userName"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Display Name"
                />
              </div>
            </div>

            {message && (
              <Alert variant={message.type === "success" ? "default" : "destructive"} className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{message.type === "success" ? "Success" : "Error"}</AlertTitle>
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleCreateAdmin} disabled={isCreating} className="w-full">
              {isCreating ? "Creating..." : "Create Admin User"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

