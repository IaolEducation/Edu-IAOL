"use client"

import { useEffect, useRef } from "react"
import { getExperiences, getCompanies } from "@/lib/data-utils"

export default function DataInitializer() {
  const initialized = useRef(false)

  useEffect(() => {
    // Check if data is already initialized
    if (initialized.current) return

    initialized.current = true

    const initializeData = async () => {
      try {
        console.log("Initializing data - checking Firebase connection...")

        // Pre-fetch both experiences and companies to warm up the cache
        const experiencesPromise = getExperiences()
        const companiesPromise = getCompanies()

        // Wait for both to complete
        const [experiences, companies] = await Promise.all([experiencesPromise, companiesPromise])

        console.log(
          `Firebase connection successful - pre-loaded ${experiences.length} experiences and ${companies.length} companies`,
        )
        localStorage.setItem("firebase_connection_verified", "true")
      } catch (error: any) {
        console.error("Error connecting to Firebase:", error)
        // Don't show error toast to users - just log it
        // The app will fall back to mock data
      }
    }

    initializeData()
  }, []) // Empty dependency array ensures this runs only once

  return null
}

