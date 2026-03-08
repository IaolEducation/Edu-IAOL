import { doc, updateDoc, getDoc } from "firebase/firestore"
import { db } from "./firebase"

/**
 * Promotes a user to admin role
 * @param userId The Firebase user ID to promote
 * @returns Promise<boolean> indicating success or failure
 */
export async function promoteUserToAdmin(userId: string): Promise<boolean> {
  try {
    // Get reference to the user document
    const userRef = doc(db, "users", userId)

    // Check if user exists
    const userSnap = await getDoc(userRef)
    if (!userSnap.exists()) {
      console.error("User does not exist")
      return false
    }

    // Update the user's role to admin
    await updateDoc(userRef, {
      role: "admin",
    })

    console.log(`User ${userId} promoted to admin successfully`)
    return true
  } catch (error) {
    console.error("Error promoting user to admin:", error)
    return false
  }
}

