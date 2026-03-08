"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  reauthenticateWithPopup,
} from "firebase/auth"
import { doc, setDoc, getDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { toast } from "@/hooks/use-toast"

/** Hardcoded admin emails – these users are always treated as admin when signed in. */
const ADMIN_EMAILS = ["talibhassan1122@gmail.com", "iaoleducation65@gmail.com"]

function isHardcodedAdminEmail(email: string | null): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.trim().toLowerCase())
}

async function isUserInAdminsCollection(uid: string): Promise<boolean> {
  try {
    const adminRef = doc(db, "admins", uid)
    const snap = await getDoc(adminRef)
    return snap.exists()
  } catch {
    return false
  }
}

export type UserRole = "student" | "admin"

/** Profile type chosen after login: college student, exam-prep student, or professional (working). */
export type UserType = "college_student" | "student" | "professional"

export interface User {
  uid: string
  email: string | null
  displayName?: string | null
  photoURL?: string | null
  role: UserRole
  emailVerified: boolean
  /** Set after onboarding; null if not chosen yet. */
  userType: UserType | null
}

export interface ContactInfo {
  phone?: string
  username?: string
  instagram?: string
  linkedin?: string
  facebook?: string
  bio?: string
  publicEmail?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  register: (email: string, password: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateUserType: (userType: UserType) => Promise<void>
  updateDisplayName: (name: string) => Promise<void>
  updateContactInfo: (info: ContactInfo) => Promise<void>
  deleteAccount: (password?: string) => Promise<void>
  isAdmin: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setIsAuthenticated(true)
        try {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))

          if (userDoc.exists()) {
            const userData = userDoc.data()
            const fromDocAdmin = userData.role === "admin"
            const fromAdminsCollection = await isUserInAdminsCollection(firebaseUser.uid)
            const fromHardcodedEmail = isHardcodedAdminEmail(firebaseUser.email ?? null)
            const userRole = fromDocAdmin || fromAdminsCollection || fromHardcodedEmail ? "admin" : "student"
            setIsAdmin(userRole === "admin")

            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: userData.displayName || firebaseUser.displayName,
              photoURL: userData.photoURL || firebaseUser.photoURL,
              role: userRole,
              emailVerified: firebaseUser.emailVerified,
              userType: (userData.userType as UserType) || null,
            })

            // Also set admin data in localStorage for backward compatibility
            if (userRole === "admin") {
              localStorage.setItem(
                "currentAdmin",
                JSON.stringify({
                  uid: firebaseUser.uid,
                  email: firebaseUser.email,
                  name: userData.displayName || firebaseUser.displayName || "Admin User",
                }),
              )
            } else {
              // Ensure non-admin users don't have admin data in localStorage
              localStorage.removeItem("currentAdmin")
            }
          } else {
            // User document doesn't exist, create it
            try {
              await setDoc(doc(db, "users", firebaseUser.uid), {
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0],
                photoURL: firebaseUser.photoURL || null,
                role: "student",
                userType: null, // Will be set on onboarding
                createdAt: serverTimestamp(),
              })

              const hardcodedAdmin = isHardcodedAdminEmail(firebaseUser.email ?? null)
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0],
                photoURL: firebaseUser.photoURL,
                role: hardcodedAdmin ? "admin" : "student",
                emailVerified: firebaseUser.emailVerified,
                userType: null,
              })
              setIsAdmin(hardcodedAdmin)
              if (hardcodedAdmin) {
                localStorage.setItem(
                  "currentAdmin",
                  JSON.stringify({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Admin User",
                  }),
                )
              } else {
                localStorage.removeItem("currentAdmin")
              }
            } catch (error) {
              console.error("Error creating user document:", error)
              // Still set the user with default values even if document creation fails
              const hardcodedAdmin = isHardcodedAdminEmail(firebaseUser.email ?? null)
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0],
                photoURL: firebaseUser.photoURL,
                role: hardcodedAdmin ? "admin" : "student",
                emailVerified: firebaseUser.emailVerified,
                userType: null,
              })
              setIsAdmin(hardcodedAdmin)
              if (!hardcodedAdmin) localStorage.removeItem("currentAdmin")
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
          const fromAdmins = await isUserInAdminsCollection(firebaseUser.uid).catch(() => false)
          const fromHardcoded = isHardcodedAdminEmail(firebaseUser.email ?? null)
          const isAdminUser = fromAdmins || fromHardcoded
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0],
            photoURL: firebaseUser.photoURL,
            role: isAdminUser ? "admin" : "student",
            emailVerified: firebaseUser.emailVerified,
            userType: null,
          })
          setIsAdmin(isAdminUser)
          if (!isAdminUser) localStorage.removeItem("currentAdmin")
        }
      } else {
        setUser(null)
        setIsAdmin(false)
        setIsAuthenticated(false)

        // Clear admin data from localStorage
        if (typeof window !== "undefined") {
          localStorage.removeItem("currentAdmin")
        }
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const register = async (email: string, password: string) => {
    try {
      setLoading(true)

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Send email verification
      await sendEmailVerification(firebaseUser)

      // Extract display name from email (part before @)
      const displayName = email.split("@")[0]

      // Create user document in Firestore
      try {
        await setDoc(doc(db, "users", firebaseUser.uid), {
          email: firebaseUser.email,
          displayName: displayName,
          role: "student",
          userType: null,
          createdAt: serverTimestamp(),
        })
      } catch (error) {
        console.error("Error creating user document during registration:", error)
      }

      toast({
        title: "Registration successful!",
        description: "A verification email has been sent. Please verify your email to access all features.",
      })
    } catch (error: any) {
      console.error("Registration error:", error)

      let errorMessage = "Registration failed. Please try again."

      if (error.code === "auth/email-already-in-use") {
        errorMessage = "This email is already registered. Please login instead."
      } else if (error.message) {
        errorMessage = error.message
      }

      toast({
        title: "Registration Error",
        description: errorMessage,
        variant: "destructive",
      })

      throw error
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)

      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Get user data from Firestore
      try {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))

        if (userDoc.exists()) {
          const userData = userDoc.data()

          // Check if user is admin
          if (userData.role === "admin") {
            // Store admin info in localStorage for backward compatibility
            localStorage.setItem(
              "currentAdmin",
              JSON.stringify({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                name: userData.displayName || firebaseUser.displayName || "Admin User",
              }),
            )
          } else {
            // Ensure non-admin users don't have admin data in localStorage
            localStorage.removeItem("currentAdmin")
          }

          toast({
            title: "Login Successful",
            description: `Welcome back, ${userData.displayName || email.split("@")[0]}!`,
          })
        } else {
          // User document doesn't exist, create it
          await setDoc(doc(db, "users", firebaseUser.uid), {
            email: firebaseUser.email,
            displayName: email.split("@")[0],
            role: "student",
            userType: null,
            createdAt: serverTimestamp(),
          })

          // Ensure non-admin users don't have admin data in localStorage
          localStorage.removeItem("currentAdmin")

          toast({
            title: "Login Successful",
            description: `Welcome, ${email.split("@")[0]}!`,
          })
        }
      } catch (error) {
        console.error("Error fetching/creating user data during login:", error)
        // Continue with login even if document fetching/creation fails
        toast({
          title: "Login Successful",
          description: `Welcome, ${email.split("@")[0]}!`,
        })
      }
    } catch (error: any) {
      console.error("Login error:", error)

      let errorMessage = "Login failed. Please check your credentials and try again."

      if (error.code === "auth/invalid-credential") {
        errorMessage = "Invalid email or password. Please try again."
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "User not found. Please register first."
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password. Please try again."
      } else if (error.message) {
        errorMessage = error.message
      }

      toast({
        title: "Login Error",
        description: errorMessage,
        variant: "destructive",
      })

      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      await signOut(auth)

      // Clear admin data from localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("currentAdmin")
      }

      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      })
    } catch (error) {
      console.error("Logout error:", error)

      toast({
        title: "Logout Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const doResetPassword = async (email: string) => {
    try {
      setLoading(true)
      await firebaseSendPasswordResetEmail(auth, email)

      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for instructions to reset your password.",
      })
    } catch (error: any) {
      console.error("Password reset error:", error)

      let errorMessage = "Failed to send password reset email. Please try again."

      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email address."
      } else if (error.message) {
        errorMessage = error.message
      }

      toast({
        title: "Password Reset Error",
        description: errorMessage,
        variant: "destructive",
      })

      throw error
    } finally {
      setLoading(false)
    }
  }

  const loginWithGoogle = async () => {
    try {
      setLoading(true)
      const provider = new GoogleAuthProvider()
      const userCredential = await signInWithPopup(auth, provider)
      const firebaseUser = userCredential.user

      const userRef = doc(db, "users", firebaseUser.uid)
      const userSnap = await getDoc(userRef)
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0],
          photoURL: firebaseUser.photoURL || null,
          role: "student",
          userType: null,
          createdAt: serverTimestamp(),
        })
      } else if (firebaseUser.photoURL && !userSnap.data().photoURL) {
        // Backfill photoURL for existing Google users who don't have it stored yet
        await updateDoc(userRef, { photoURL: firebaseUser.photoURL })
      }

      toast({
        title: "Signed in with Google",
        description: `Welcome, ${firebaseUser.displayName || firebaseUser.email?.split("@")[0]}!`,
      })
    } catch (error: unknown) {
      console.error("Google sign-in error:", error)
      const msg = error instanceof Error ? error.message : "Google sign-in failed."
      toast({ title: "Sign-in Error", description: msg, variant: "destructive" })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateUserType = async (userType: UserType) => {
    const firebaseUser = auth.currentUser
    if (!firebaseUser) return
    try {
      const userRef = doc(db, "users", firebaseUser.uid)
      await updateDoc(userRef, { userType, updatedAt: serverTimestamp() })
      setUser((prev) => (prev ? { ...prev, userType } : null))
      toast({ title: "Profile updated", description: "Your profile type has been saved." })
    } catch (e) {
      console.error("Error updating userType:", e)
      toast({ title: "Error", description: "Could not save profile type.", variant: "destructive" })
      throw e
    }
  }

  const updateContactInfo = async (info: ContactInfo) => {
    const firebaseUser = auth.currentUser
    if (!firebaseUser) return
    try {
      const userRef = doc(db, "users", firebaseUser.uid)
      await updateDoc(userRef, { ...info, updatedAt: serverTimestamp() })
      toast({ title: "Contact info saved", description: "Your contact details have been updated." })
    } catch (e) {
      console.error("Error updating contact info:", e)
      toast({ title: "Error", description: "Could not save contact info.", variant: "destructive" })
      throw e
    }
  }

  const updateDisplayName = async (name: string) => {
    const firebaseUser = auth.currentUser
    if (!firebaseUser) return
    try {
      const userRef = doc(db, "users", firebaseUser.uid)
      await updateDoc(userRef, { displayName: name, updatedAt: serverTimestamp() })
      setUser((prev) => (prev ? { ...prev, displayName: name } : null))
      toast({ title: "Name updated", description: "Your display name has been saved." })
    } catch (e) {
      console.error("Error updating displayName:", e)
      toast({ title: "Error", description: "Could not update name.", variant: "destructive" })
      throw e
    }
  }

  const deleteAccount = async (password?: string) => {
    const firebaseUser = auth.currentUser
    if (!firebaseUser) return
    try {
      // Re-authenticate before deleting
      if (password && firebaseUser.email) {
        const credential = EmailAuthProvider.credential(firebaseUser.email, password)
        await reauthenticateWithCredential(firebaseUser, credential)
      } else {
        // For Google sign-in users, re-authenticate with Google
        const provider = new GoogleAuthProvider()
        await reauthenticateWithPopup(firebaseUser, provider)
      }
      // Delete Firestore user document
      await deleteDoc(doc(db, "users", firebaseUser.uid))
      // Delete Firebase Auth account
      await deleteUser(firebaseUser)
      setUser(null)
      setIsAdmin(false)
      setIsAuthenticated(false)
      if (typeof window !== "undefined") localStorage.removeItem("currentAdmin")
      toast({ title: "Account deleted", description: "Your account has been permanently deleted." })
    } catch (e: any) {
      console.error("Error deleting account:", e)
      let msg = "Could not delete account. Please try again."
      if (e.code === "auth/wrong-password") msg = "Incorrect password. Please try again."
      if (e.code === "auth/requires-recent-login") msg = "Please log out and log back in before deleting your account."
      toast({ title: "Error", description: msg, variant: "destructive" })
      throw e
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        loginWithGoogle,
        logout,
        resetPassword: doResetPassword,
        updateUserType,
        updateDisplayName,
        updateContactInfo,
        deleteAccount,
        isAdmin,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

