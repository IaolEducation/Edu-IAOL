import type { Experience } from "@/components/experience-list"
import { collection, getDocs, query, where, orderBy, doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export interface Company {
  id: number
  name: string
  logo: string
  category: string
  studentsPlaced: number
  experiencesCount?: number
}

export interface Admin {
  uid: string
  email: string
  name: string
}

// Cache for approved experiences to avoid multiple fetches
let cachedApprovedExperiences: Experience[] | null = null

// Fetch all experiences from Firestore - requires authentication
export async function getExperiences(): Promise<Experience[]> {
  try {
    console.log("Fetching experiences from Firestore...")

    // Create a query against the experiences collection
    const experiencesRef = collection(db, "experiences")
    const q = query(experiencesRef, orderBy("submittedAt", "desc"))

    const querySnapshot = await getDocs(q)

    // Map the documents to our Experience type
    const experiences: Experience[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      experiences.push({
        id: doc.id as unknown as number,
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
      })
    })

    console.log(`Fetched ${experiences.length} experiences from Firestore`)

    // If no experiences were found, return approved experiences
    if (experiences.length === 0) {
      console.log("No experiences found in Firestore, returning approved experiences")
      return getApprovedExperiences()
    }

    return experiences
  } catch (error) {
    console.error("Error fetching experiences from Firestore:", error)
    console.log("Returning approved experiences due to error")
    return getApprovedExperiences()
  }
}

// Fetch approved experiences only - for public display
let approvedExperiencesCache: Experience[] | null = null

export async function getApprovedExperiences(): Promise<Experience[]> {
  // Return cached experiences if available
  if (approvedExperiencesCache) {
    return approvedExperiencesCache
  }

  try {
    const experiencesRef = collection(db, "experiences")
    // Remove the orderBy to avoid requiring a composite index
    const q = query(experiencesRef, where("status", "==", "approved"))

    const querySnapshot = await getDocs(q)
    const experiences = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Experience[]

    // Sort in memory instead of in the query
    experiences.sort((a, b) => {
      const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0
      const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0
      return dateB - dateA // descending order
    })

    // Cache the results
    approvedExperiencesCache = experiences
    return experiences
  } catch (error) {
    console.error("Error fetching approved experiences:", error)
    return []
  }
}

export async function getRecentExperiences(count = 5): Promise<Experience[]> {
  try {
    const experiencesRef = collection(db, "experiences")
    // Remove the orderBy to avoid requiring a composite index
    const q = query(experiencesRef, where("status", "==", "approved"))

    const querySnapshot = await getDocs(q)
    const experiences = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Experience[]

    // Sort in memory instead of in the query
    experiences.sort((a, b) => {
      const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0
      const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0
      return dateB - dateA // descending order
    })

    // Return only the requested number of experiences
    return experiences.slice(0, count)
  } catch (error) {
    console.error("Error fetching recent experiences:", error)
    // Use approved experiences as fallback
    const allApproved = await getApprovedExperiences()
    return allApproved.slice(0, count)
  }
}

// Fetch a single experience by ID without requiring authentication
export async function getExperienceById(id: string): Promise<Experience | null> {
  try {
    console.log(`Fetching experience with ID: ${id}`)

    const experienceRef = doc(db, "experiences", id)
    const experienceSnap = await getDoc(experienceRef)

    if (!experienceSnap.exists()) {
      console.log(`No experience found with ID: ${id}`)
      return null
    }

    const data = experienceSnap.data()

    // For non-approved experiences, we'll still return them but they'll be filtered out in the UI
    // unless the user is the owner or an admin
    return {
      id: experienceSnap.id as unknown as number,
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
  } catch (error) {
    console.error(`Error fetching experience with ID ${id}:`, error)
    return null
  }
}

// Get placement statistics
export async function getPlacementStats() {
  try {
    // Use the getApprovedExperiences function to ensure we only count approved experiences
    const approvedExperiences = await getApprovedExperiences()

    // Calculate statistics
    const totalPlacements = approvedExperiences.length

    // Count by company
    const companyCount = approvedExperiences.reduce(
      (acc, exp) => {
        const company = exp.company || "Unknown"
        acc[company] = (acc[company] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Count by branch
    const branchCount = approvedExperiences.reduce(
      (acc, exp) => {
        const branch = exp.branch || "Unknown"
        acc[branch] = (acc[branch] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Count by year
    const yearCount = approvedExperiences.reduce(
      (acc, exp) => {
        const year = exp.year?.toString() || "Unknown"
        acc[year] = (acc[year] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Count by company type
    const companyTypeCount = approvedExperiences.reduce(
      (acc, exp) => {
        const companyType = exp.companyType || "Unknown"
        acc[companyType] = (acc[companyType] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Calculate package statistics
    const packages = approvedExperiences
      .map((exp) => Number.parseFloat(exp.package?.toString() || "0"))
      .filter((pkg) => pkg > 0)

    const avgPackage = packages.length > 0 ? packages.reduce((sum, pkg) => sum + pkg, 0) / packages.length : 0

    const maxPackage = packages.length > 0 ? Math.max(...packages) : 0

    // Top companies by placement count
    const topCompanies = Object.entries(companyCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([company, count]) => ({ company, count }))

    // Top branches by placement count
    const topBranches = Object.entries(branchCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([branch, count]) => ({ branch, count }))

    return {
      totalPlacements,
      companyCount,
      branchCount,
      yearCount,
      companyTypeCount,
      avgPackage,
      maxPackage,
      topCompanies,
      topBranches,
      // Add year-wise trends
      yearTrend: Object.entries(yearCount)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([year, count]) => ({ year, count })),
      // Add company type distribution
      companyTypeDistribution: Object.entries(companyTypeCount).map(([type, count]) => ({
        type: getCompanyTypeName(type),
        count,
        percentage: Math.round((count / totalPlacements) * 100),
      })),
    }
  } catch (error) {
    console.error("Error calculating placement stats:", error)

    // Return default statistics
    return getDefaultPlacementStats()
  }
}

// Get unique companies from experiences
export async function getCompanies(): Promise<string[]> {
  try {
    const experiences = await getApprovedExperiences()

    // Extract unique company names
    const companies = new Set<string>()
    experiences.forEach((experience) => {
      if (experience.company && typeof experience.company === "string") {
        companies.add(experience.company)
      }
    })

    // Convert Set to Array and sort alphabetically
    return Array.from(companies).sort()
  } catch (error) {
    console.error("Error fetching companies:", error)
    return []
  }
}

// Get unique branches from experiences
export async function getBranches() {
  try {
    // Use approved experiences only for public-facing filters
    const experiences = await getApprovedExperiences()

    // Extract unique branches
    const uniqueBranches = Array.from(new Set(experiences.map((exp) => exp.branch)))
      .filter(Boolean)
      .sort()

    return uniqueBranches.map((branch) => ({
      name: branch,
      value: branch.toLowerCase().replace(/\s+/g, "-"),
    }))
  } catch (error) {
    console.error("Error fetching branches:", error)
    return getDefaultBranches()
  }
}

// Get unique years from experiences
export async function getYears() {
  try {
    // Use approved experiences only for public-facing filters
    const experiences = await getApprovedExperiences()

    // Extract unique years
    const uniqueYears = Array.from(new Set(experiences.map((exp) => exp.year)))
      .filter(Boolean)
      .sort((a, b) => b - a) // Sort in descending order (most recent first)

    return uniqueYears.map((year) => ({
      name: year.toString(),
      value: year.toString(),
    }))
  } catch (error) {
    console.error("Error fetching years:", error)
    return getDefaultYears()
  }
}

// Get placement types
export function getPlacementTypes() {
  return [
    { name: "On-Campus", value: "on-campus" },
    { name: "Off-Campus", value: "off-campus" },
    { name: "Internship", value: "internship" },
  ]
}

// Get company types
export function getCompanyTypes() {
  return [
    { name: "Tech", value: "tech" },
    { name: "Finance", value: "finance" },
    { name: "Core", value: "core" },
    { name: "Product", value: "product" },
    { name: "Service", value: "service" },
    { name: "Consulting", value: "consulting" },
    { name: "E-Commerce", value: "ecommerce" },
    { name: "Healthcare", value: "healthcare" },
    { name: "Manufacturing", value: "manufacturing" },
    { name: "Other", value: "other" },
  ]
}

// This function now fetches real approved experiences from Firebase
// but keeps the same name for backward compatibility
export async function getMockExperiences(): Promise<Experience[]> {
  try {
    console.log("Fetching approved experiences for public display...")

    // Return cached experiences if available
    if (cachedApprovedExperiences) {
      console.log("Using cached approved experiences")
      return cachedApprovedExperiences
    }

    // Create a query against the experiences collection for approved experiences only
    const experiencesRef = collection(db, "experiences")
    // Remove the orderBy to avoid requiring a composite index
    const q = query(experiencesRef, where("status", "==", "approved"))

    const querySnapshot = await getDocs(q)

    // Map the documents to our Experience type
    const experiences: Experience[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      experiences.push({
        id: doc.id as unknown as number,
        studentName: data.studentName || "Anonymous",
        branch: data.branch || "Unknown",
        company: data.company || "Unknown",
        companyType: data.companyType,
        year: data.year || new Date().getFullYear(),
        type: data.type || "Unknown",
        excerpt: data.excerpt || data.interviewProcess?.substring(0, 150) || "No details provided",
        profileImage: data.profileImage || "/placeholder.svg?height=100&width=100",
        companyLogo: "/placeholder.svg?height=40&width=40",
        status: "approved",
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
      })
    })

    // Sort in memory instead of in the query
    experiences.sort((a, b) => {
      const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0
      const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0
      return dateB - dateA // descending order
    })

    console.log(`Fetched ${experiences.length} approved experiences for public display`)

    // Cache the approved experiences
    cachedApprovedExperiences = experiences

    return experiences
  } catch (error) {
    console.error("Error fetching approved experiences:", error)
    return []
  }
}

export async function getDefaultExperiences(): Promise<Experience[]> {
  // This function now returns approved experiences as a fallback
  return getApprovedExperiences()
}

// Default data functions for fallback
function getDefaultExperiencesFallback(): Experience[] {
  return [
    {
      id: 1,
      studentName: "Rahul Sharma",
      branch: "Computer Science",
      company: "Microsoft",
      companyType: "tech",
      year: 2023,
      type: "On-Campus",
      excerpt:
        "The interview process consisted of 3 technical rounds and 1 HR round. The technical rounds focused on data structures, algorithms, and system design...",
      profileImage: "/placeholder.svg?height=100&width=100",
      companyLogo: "/placeholder.svg?height=40&width=40",
      status: "approved",
      preparationStrategy:
        "I focused on strengthening my fundamentals in data structures and algorithms. I solved problems on LeetCode daily, starting with easy ones and gradually moving to medium and hard.",
      interviewProcess:
        "The interview process at Microsoft consisted of 3 technical rounds and 1 HR round. The first round focused on problem-solving with data structures like arrays and strings.",
      tips: "Start your preparation early, at least 3-4 months before the placement season. Focus on understanding concepts rather than memorizing solutions.",
      challenges:
        "The most challenging part was the system design round as I had limited experience in this area. I overcame this by studying system design principles and practicing designing simple systems.",
      role: "Software Engineer",
    },
    {
      id: 2,
      studentName: "Priya Patel",
      branch: "Electronics & Communication",
      company: "Amazon",
      companyType: "tech",
      year: 2023,
      type: "On-Campus",
      excerpt:
        "Preparation for Amazon required strong fundamentals in data structures and algorithms. The interview process was rigorous with 4 rounds...",
      profileImage: "/placeholder.svg?height=100&width=100",
      companyLogo: "/placeholder.svg?height=40&width=40",
      status: "approved",
      preparationStrategy:
        "I prepared for Amazon by focusing on their leadership principles alongside technical skills. I solved at least 200 LeetCode problems, focusing on medium and hard difficulty.",
      interviewProcess:
        "Amazon's interview process had 4 rounds: an online assessment followed by 3 interview rounds. The online assessment had 2 coding problems and some MCQs.",
      tips: "For Amazon, understand their leadership principles thoroughly and prepare examples from your experience that demonstrate these principles.",
      challenges:
        "The biggest challenge was balancing technical preparation with behavioral question preparation. Amazon places a lot of emphasis on their leadership principles.",
      role: "Software Development Engineer",
    },
    {
      id: 3,
      studentName: "Vikram Singh",
      branch: "Mechanical Engineering",
      company: "Tata Motors",
      companyType: "core",
      year: 2023,
      type: "On-Campus",
      excerpt:
        "The selection process at Tata Motors involved technical tests, group discussions, and interviews focusing on mechanical engineering fundamentals...",
      profileImage: "/placeholder.svg?height=100&width=100",
      companyLogo: "/placeholder.svg?height=40&width=40",
      status: "approved",
      preparationStrategy:
        "I focused on core mechanical engineering subjects like thermodynamics, fluid mechanics, and machine design. I also brushed up on my knowledge of automotive systems.",
      interviewProcess:
        "The selection process had multiple rounds: an online technical test, a group discussion on current automotive trends, and two interview rounds.",
      tips: "For core companies like Tata Motors, having a strong grasp of fundamentals is crucial. Also, stay updated with industry trends and new technologies.",
      challenges:
        "The group discussion was challenging as it required both technical knowledge and good communication skills. I prepared by participating in mock GDs with my friends.",
      role: "Graduate Engineer Trainee",
    },
  ]
}

function getDefaultPlacementStats() {
  return {
    totalPlacements: 150,
    companyCount: {
      Microsoft: 15,
      Google: 12,
      Amazon: 20,
      Infosys: 25,
      TCS: 30,
      "Tata Motors": 10,
      Other: 38,
    },
    branchCount: {
      "Computer Science": 60,
      "Electronics & Communication": 35,
      "Mechanical Engineering": 20,
      "Civil Engineering": 15,
      "Electrical Engineering": 20,
    },
    yearCount: {
      "2023": 50,
      "2022": 45,
      "2021": 55,
    },
    companyTypeCount: {
      tech: 70,
      service: 40,
      core: 25,
      finance: 15,
    },
    avgPackage: 12.5,
    maxPackage: 45.0,
    topCompanies: [
      { company: "Amazon", count: 20 },
      { company: "TCS", count: 30 },
      { company: "Infosys", count: 25 },
      { company: "Microsoft", count: 15 },
      { company: "Google", count: 12 },
    ],
    topBranches: [
      { branch: "Computer Science", count: 60 },
      { branch: "Electronics & Communication", count: 35 },
      { branch: "Mechanical Engineering", count: 20 },
      { branch: "Electrical Engineering", count: 20 },
      { branch: "Civil Engineering", count: 15 },
    ],
    yearTrend: [
      { year: "2021", count: 55 },
      { year: "2022", count: 45 },
      { year: "2023", count: 50 },
    ],
    companyTypeDistribution: [
      { type: "Tech", count: 70, percentage: 47 },
      { type: "Service", count: 40, percentage: 27 },
      { type: "Core", count: 25, percentage: 17 },
      { type: "Finance", count: 15, percentage: 10 },
    ],
  }
}

function getDefaultCompanies() {
  return [
    { name: "Microsoft", value: "microsoft" },
    { name: "Google", value: "google" },
    { name: "Amazon", value: "amazon" },
    { name: "Tata Motors", value: "tata-motors" },
    { name: "Infosys", value: "infosys" },
    { name: "TCS", value: "tcs" },
  ]
}

export async function getExperiencesByCompany(companyName: string): Promise<Experience[]> {
  try {
    const experiencesRef = collection(db, "experiences")
    const q = query(experiencesRef, where("status", "==", "approved"), where("company", "==", companyName))

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Experience[]
  } catch (error) {
    console.error(`Error fetching experiences for company ${companyName}:`, error)

    // Use approved experiences as fallback and filter by company
    const allApproved = await getApprovedExperiences()
    return allApproved.filter((exp) => exp.company === companyName)
  }
}

function getDefaultBranches() {
  return [
    { name: "Computer Science", value: "computer-science" },
    { name: "Electronics & Communication", value: "electronics-&-communication" },
    { name: "Mechanical Engineering", value: "mechanical-engineering" },
    { name: "Civil Engineering", value: "civil-engineering" },
    { name: "Electrical Engineering", value: "electrical-engineering" },
  ]
}

function getDefaultYears() {
  const currentYear = new Date().getFullYear()
  return [
    { name: currentYear.toString(), value: currentYear.toString() },
    { name: (currentYear - 1).toString(), value: (currentYear - 1).toString() },
    { name: (currentYear - 2).toString(), value: (currentYear - 2).toString() },
  ]
}

// Helper function to get company type name
export function getCompanyTypeName(value: string): string {
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

