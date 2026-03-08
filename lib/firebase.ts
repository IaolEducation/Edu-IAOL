import { initializeApp } from "firebase/app"
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth"
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  query,
  where,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage" // Add these imports

// Add this import at the top if not already present
import type { Experience } from "@/components/experience-list"
import type { Company, Admin } from "./data-utils"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  ...(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID && {
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  }),
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app) // Initialize Firebase Storage

// Add this function to handle image uploads
export async function uploadImageToStorage(file: File, path: string): Promise<string> {
  try {
    console.log(`Uploading file to ${path}`)
    const storageRef = ref(storage, path)

    // Upload the file
    const snapshot = await uploadBytes(storageRef, file)
    console.log("File uploaded successfully")

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref)
    console.log("Download URL:", downloadURL)

    return downloadURL
  } catch (error) {
    console.error("Error uploading file:", error)
    throw error
  }
}

// Function to get experiences from Firestore
export async function getExperiencesFromFirestore(): Promise<Experience[]> {
  try {
    console.log("Fetching experiences from Firestore for all users")
    const experiencesRef = collection(db, "experiences")

    // Get all experiences without filtering by status
    const experiencesSnapshot = await getDocs(experiencesRef)
    console.log(`Retrieved ${experiencesSnapshot.size} experiences from Firestore`)

    const experiences: Experience[] = []
    experiencesSnapshot.forEach((doc) => {
      const data = doc.data()
      experiences.push({
        id: Number.parseInt(doc.id) || Date.now(),
        studentName: data.studentName || "",
        branch: data.branch || "",
        company: data.company || "",
        companyType: data.companyType || "tech",
        year: data.year || new Date().getFullYear(),
        type: data.type || "On-Campus",
        excerpt: data.excerpt || "",
        profileImage: data.profileImage || "/placeholder.svg?height=100&width=100",
        companyLogo: data.companyLogo || "/placeholder.svg?height=40&width=40",
        status: data.status || "pending",
        linkedIn: data.linkedIn || "",
        github: data.github || "",
        personalEmail: data.personalEmail || "",
        preparationStrategy: data.preparationStrategy || "",
        interviewProcess: data.interviewProcess || "",
        tips: data.tips || "",
        challenges: data.challenges || "",
        resources: data.resources || [],
        role: data.role || "",
        submittedAt: data.submittedAt ? new Date(data.submittedAt.toDate()).toISOString() : new Date().toISOString(),
        package: data.package || "",
      })
    })

    console.log(`Processed ${experiences.length} experiences from Firestore`)
    return experiences
  } catch (error) {
    console.error("Error getting experiences from Firestore:", error)
    return [] // Return empty array instead of throwing error
  }
}

// Function to get companies from Firestore
export async function getCompaniesFromFirestore(): Promise<Company[]> {
  try {
    console.log("Fetching companies from Firestore")
    const companiesRef = collection(db, "companies")
    const companiesSnapshot = await getDocs(companiesRef)

    // Get all approved experiences to count by company
    const experiencesRef = collection(db, "experiences")
    const q = query(experiencesRef, where("status", "==", "approved"))
    const experiencesSnapshot = await getDocs(q)

    // Create a map to count experiences by company
    const experienceCountByCompany = new Map<string, number>()

    experiencesSnapshot.forEach((doc) => {
      const data = doc.data()
      const companyName = data.company || ""

      if (companyName) {
        const currentCount = experienceCountByCompany.get(companyName) || 0
        experienceCountByCompany.set(companyName, currentCount + 1)
      }
    })

    const companies: Company[] = []
    companiesSnapshot.forEach((doc) => {
      const data = doc.data()
      const companyName = data.name || ""

      companies.push({
        id: data.id || Date.now(),
        name: companyName,
        logo: data.logo || "/placeholder.svg?height=80&width=80",
        category: data.category || "Tech",
        studentsPlaced: data.studentsPlaced || 0,
        experiencesCount: experienceCountByCompany.get(companyName) || 0,
      })
    })

    console.log(`Retrieved ${companies.length} companies`)
    return companies
  } catch (error) {
    console.error("Error getting companies:", error)
    return []
  }
}

// Function to update an experience in Firestore
export async function updateExperienceInFirestore(updatedExperience: Experience) {
  try {
    console.log("Updating experience in Firestore:", updatedExperience.id)
    const experienceRef = doc(db, "experiences", updatedExperience.id.toString())
    await updateDoc(experienceRef, updatedExperience)
    console.log("Experience updated successfully")
    return true
  } catch (error) {
    console.error("Error updating experience:", error)
    return false
  }
}

// Function to delete an experience from Firestore
export async function deleteExperienceFromFirestore(id: number) {
  try {
    console.log("Deleting experience from Firestore:", id)
    const experienceRef = doc(db, "experiences", id.toString())

    // Get the experience data to check if it was approved
    const experienceSnap = await getDoc(experienceRef)
    if (experienceSnap.exists()) {
      const experienceData = experienceSnap.data()
      const companyName = experienceData.company
      const wasApproved = experienceData.status === "approved"

      // Delete the experience
      await deleteDoc(experienceRef)

      // If the experience was approved, decrement the company's experiencesCount
      if (wasApproved && companyName) {
        const companyRef = doc(db, "companies", companyName)
        const companySnap = await getDoc(companyRef)

        if (companySnap.exists()) {
          const companyData = companySnap.data()
          const currentCount = companyData.experiencesCount || 0

          await updateDoc(companyRef, {
            experiencesCount: Math.max(0, currentCount - 1),
          })
        }
      }
    }

    console.log("Experience deleted successfully")
    return true
  } catch (error) {
    console.error("Error deleting experience:", error)
    return false
  }
}

// Function to check if a company exists in Firestore
export async function companyExistsInFirestore(companyName: string): Promise<boolean> {
  try {
    const companyRef = doc(db, "companies", companyName)
    const companySnap = await getDoc(companyRef)
    return companySnap.exists()
  } catch (error) {
    console.error("Error checking if company exists:", error)
    return false
  }
}

// Function to get a company by name from Firestore
export async function getCompanyByNameFromFirestore(companyName: string): Promise<Company | null> {
  try {
    const companyRef = doc(db, "companies", companyName)
    const companySnap = await getDoc(companyRef)

    if (companySnap.exists()) {
      const data = companySnap.data()
      return {
        id: data.id || Date.now(),
        name: data.name || "",
        logo: data.logo || "/placeholder.svg?height=80&width=80",
        category: data.category || "Tech",
        studentsPlaced: data.studentsPlaced || 0,
      }
    } else {
      return null
    }
  } catch (error) {
    console.error("Error getting company by name:", error)
    return null
  }
}

// Change the function declaration to export it
export async function addOrUpdateCompanyInFirestore(
  companyName: string,
  companyLogo = "/placeholder.svg?height=80&width=80",
  companyType = "tech",
) {
  try {
    const companyRef = doc(db, "companies", companyName)
    const companySnap = await getDoc(companyRef)

    // Get the current count of approved experiences for this company
    const experiencesRef = collection(db, "experiences")
    const q = query(experiencesRef, where("company", "==", companyName), where("status", "==", "approved"))
    const experiencesSnapshot = await getDocs(q)
    const experiencesCount = experiencesSnapshot.size

    if (companySnap.exists()) {
      // Update the company if it exists
      await updateDoc(companyRef, {
        logo: companyLogo,
        category: companyType,
        experiencesCount: experiencesCount,
      })
      console.log("Company updated successfully")
    } else {
      // Add the company if it doesn't exist
      await setDoc(companyRef, {
        name: companyName,
        logo: companyLogo,
        category: companyType,
        studentsPlaced: 0, // Initialize studentsPlaced
        experiencesCount: experiencesCount,
      })
      console.log("Company added successfully")
    }
    return true
  } catch (error) {
    console.error("Error adding/updating company:", error)
    return false
  }
}

// Function to approve an experience in Firestore
export async function approveExperienceInFirestore(id: number) {
  try {
    console.log("Approving experience in Firestore:", id)
    const experienceRef = doc(db, "experiences", id.toString())

    // Get the experience data to get the company name
    const experienceSnap = await getDoc(experienceRef)
    if (experienceSnap.exists()) {
      const experienceData = experienceSnap.data()
      const companyName = experienceData.company

      // Update the experience status
      await updateDoc(experienceRef, {
        status: "approved",
      })

      // Update the company's experiencesCount
      if (companyName) {
        const companyRef = doc(db, "companies", companyName)
        const companySnap = await getDoc(companyRef)

        if (companySnap.exists()) {
          const companyData = companySnap.data()
          const currentCount = companyData.experiencesCount || 0

          await updateDoc(companyRef, {
            experiencesCount: currentCount + 1,
          })
        }
      }
    }

    console.log("Experience approved successfully")
    return true
  } catch (error) {
    console.error("Error approving experience:", error)
    return false
  }
}

// Function to reject an experience in Firestore
export async function rejectExperienceInFirestore(id: number) {
  try {
    console.log("Rejecting experience in Firestore:", id)
    const experienceRef = doc(db, "experiences", id.toString())

    // Get the experience data to check if it was previously approved
    const experienceSnap = await getDoc(experienceRef)
    if (experienceSnap.exists()) {
      const experienceData = experienceSnap.data()
      const companyName = experienceData.company
      const wasApproved = experienceData.status === "approved"

      // Update the experience status
      await updateDoc(experienceRef, {
        status: "rejected",
      })

      // If the experience was previously approved, decrement the company's experiencesCount
      if (wasApproved && companyName) {
        const companyRef = doc(db, "companies", companyName)
        const companySnap = await getDoc(companyRef)

        if (companySnap.exists()) {
          const companyData = companySnap.data()
          const currentCount = companyData.experiencesCount || 0

          await updateDoc(companyRef, {
            experiencesCount: Math.max(0, currentCount - 1),
          })
        }
      }
    }

    console.log("Experience rejected successfully")
    return true
  } catch (error) {
    console.error("Error rejecting experience:", error)
    return false
  }
}

// Function to get pending experiences from Firestore
export async function getPendingExperiencesFromFirestore(): Promise<Experience[]> {
  try {
    console.log("Fetching pending experiences from Firestore")
    const experiencesRef = collection(db, "experiences")
    const q = query(experiencesRef, where("status", "==", "pending"))
    const experiencesSnapshot = await getDocs(q)

    const experiences: Experience[] = []
    experiencesSnapshot.forEach((doc) => {
      const data = doc.data()
      experiences.push({
        id: Number.parseInt(doc.id) || Date.now(),
        studentName: data.studentName || "",
        branch: data.branch || "",
        company: data.company || "",
        companyType: data.companyType || "tech",
        year: data.year || new Date().getFullYear(),
        type: data.type || "On-Campus",
        excerpt: data.excerpt || "",
        profileImage: data.profileImage || "/placeholder.svg?height=100&width=100",
        companyLogo: data.companyLogo || "/placeholder.svg?height=40&width=40",
        status: data.status || "pending",
        linkedIn: data.linkedIn || "",
        github: data.github || "",
        personalEmail: data.personalEmail || "",
        preparationStrategy: data.preparationStrategy || "",
        interviewProcess: data.interviewProcess || "",
        tips: data.tips || "",
        challenges: data.challenges || "",
        resources: data.resources || [],
        role: data.role || "",
        submittedAt: data.submittedAt ? new Date(data.submittedAt.toDate()).toISOString() : new Date().toISOString(),
      })
    })

    console.log(`Retrieved ${experiences.length} pending experiences`)
    return experiences
  } catch (error) {
    console.error("Error getting pending experiences:", error)
    return []
  }
}

// Function to login admin (email/password). Also ensures users/{uid} has role "admin" so auth context sees isAdmin.
export async function loginAdmin(email: string, password: string): Promise<Admin | null> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    const adminRef = doc(db, "admins", user.uid)
    const adminSnap = await getDoc(adminRef)
    const isListedAdmin = adminSnap.exists()
    const adminData = adminSnap.exists() ? adminSnap.data() : null

    // Sync admin role to users collection so AuthProvider sees isAdmin
    const userRef = doc(db, "users", user.uid)
    await setDoc(
      userRef,
      {
        email: user.email,
        displayName: adminData?.name || user.displayName || email.split("@")[0],
        role: isListedAdmin ? "admin" : "student",
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )

    if (isListedAdmin) {
      return {
        uid: user.uid,
        email: user.email || "",
        name: adminData?.name || "Admin User",
      }
    }
    await signOut(auth)
    return null
  } catch (error: unknown) {
    console.error("Error logging in admin:", error)
    throw error
  }
}

// Function to logout admin
export async function logoutAdmin() {
  try {
    await auth.signOut()
    console.log("Admin logged out successfully")
    return true
  } catch (error) {
    console.error("Error logging out admin:", error)
    return false
  }
}

// Update the saveExperienceToFirestore function to handle undefined companyType
export async function saveExperienceToFirestore(experience: Experience) {
  try {
    console.log("Saving experience to Firestore:", experience.id)

    // Add timestamp
    const experienceWithTimestamp = {
      ...experience,
      submittedAt: serverTimestamp(),
    }

    // Save experience
    await setDoc(doc(db, "experiences", experience.id.toString()), experienceWithTimestamp)

    // Update company information
    await addOrUpdateCompanyInFirestore(
      experience.company,
      experience.companyLogo || "/placeholder.svg?height=40&width=40",
      experience.companyType,
    )

    console.log("Experience saved successfully")
    return true
  } catch (error: any) {
    console.error("Error saving experience:", error)

    // Check if it's a permission error
    if (error.code === "permission-denied") {
      throw new Error("Permission denied: Please check your Firebase security rules.")
    }

    // Check if it's a network error
    if (error.code === "unavailable" || error.code === "network-request-failed") {
      throw new Error("Network error: Please check your internet connection and try again.")
    }

    // For other errors, provide a generic message
    throw new Error("Failed to save experience: " + (error.message || "Unknown error"))
  }
}

/** Student share (notes, resources, references). */
export interface StudentShare {
  type: "notes" | "resource" | "reference" | "other"
  title: string
  content: string
  links?: string[]
  authorId: string
  authorName: string
  authorType: string
  createdAt: ReturnType<typeof serverTimestamp>
  status: "published" | "archived"
}

export async function saveStudentShareToFirestore(share: Omit<StudentShare, "createdAt" | "status">): Promise<boolean> {
  try {
    await addDoc(collection(db, "shares"), {
      ...share,
      status: "published",
      createdAt: serverTimestamp(),
    })
    return true
  } catch (error: unknown) {
    console.error("Error saving student share:", error)
    throw error
  }
}

/** Profile update (exam, education tech, etc.) */
export interface ProfileUpdate {
  title: string
  content: string
  category: "exam_update" | "education_tech" | "general"
  authorId: string
  authorName: string
  createdAt: ReturnType<typeof serverTimestamp>
  status: "published"
}

export async function saveUpdateToFirestore(update: Omit<ProfileUpdate, "createdAt" | "status">): Promise<boolean> {
  try {
    await addDoc(collection(db, "updates"), {
      ...update,
      status: "published",
      createdAt: serverTimestamp(),
    })
    return true
  } catch (error: unknown) {
    console.error("Error saving update:", error)
    throw error
  }
}

export { auth, db }
