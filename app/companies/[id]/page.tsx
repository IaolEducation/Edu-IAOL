"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Building, MapPin, Briefcase, GraduationCap } from "lucide-react"
import Image from "next/image"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { ExperienceCard } from "@/components/experience-card"
import { getCompanyLogo } from "@/lib/image-utils"

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
  role?: string
  package?: string
}

interface CompanyDetails {
  name: string
  logo?: string
  type: string
  location: string
  experienceCount: number
}

export default function CompanyPage() {
  const { id } = useParams() as { id: string }
  const [company, setCompany] = useState<CompanyDetails | null>(null)
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCompanyData() {
      try {
        setLoading(true)

        // Get all experiences for this company
        const experiencesRef = collection(db, "experiences")
        const companyName = id.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
        const experiencesQuery = query(experiencesRef, where("company", "==", companyName))
        const experiencesSnapshot = await getDocs(experiencesQuery)

        if (experiencesSnapshot.empty) {
          setLoading(false)
          return
        }

        // Get approved experiences
        const approvedExperiences = experiencesSnapshot.docs
          .map((doc) => ({ ...doc.data(), firestoreId: doc.id }))
          .filter((exp) => exp.status === "approved") as Experience[]

        setExperiences(approvedExperiences)

        // Extract company details from the first experience
        const firstExp = experiencesSnapshot.docs[0].data()
        setCompany({
          name: firstExp.company,
          logo: firstExp.companyLogo,
          type: firstExp.companyType || "Unknown",
          location: firstExp.location || "Not specified",
          experienceCount: approvedExperiences.length,
        })
      } catch (error) {
        console.error("Error fetching company data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchCompanyData()
    }
  }, [id])

  if (loading) {
    return (
      <div className="container py-8 animate-pulse">
        <div className="h-12 bg-muted rounded w-1/3 mb-4"></div>
        <div className="h-6 bg-muted rounded w-1/4 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Company Not Found</CardTitle>
            <CardDescription>
              The company you're looking for doesn't exist or has no approved experiences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please check the URL or go back to the companies page.</p>
          </CardContent>
        </Card>
      </div>
    )
  }
const CompanyLogo = getCompanyLogo()
  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-8">
        <div className="w-16 h-16 rounded-lg overflow-hidden flex items-center justify-center bg-secondary">
          {company.logo ? (
            <Image
              src={CompanyLogo || "/placeholder.svg"}
              alt={company.name}
              width={64}
              height={64}
              className="object-contain"
            />
          ) : (
            <Building className="h-8 w-8 text-muted-foreground" />
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold">{company.name}</h1>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Briefcase className="h-3 w-3" />
              {company.type}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {company.location}
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <GraduationCap className="h-3 w-3" />
              {company.experienceCount} {company.experienceCount === 1 ? "Experience" : "Experiences"}
            </Badge>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      {experiences.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Approved Experiences</CardTitle>
            <CardDescription>There are no approved placement experiences for this company yet.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Experiences may be pending approval by administrators.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <h2 className="text-2xl font-semibold mb-6">Placement Experiences</h2>
          <Tabs defaultValue="all">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Experiences</TabsTrigger>
              <TabsTrigger value="internship">Internships</TabsTrigger>
              <TabsTrigger value="placement">Placements</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {experiences.map((experience) => (
                  <ExperienceCard key={experience.id} experience={experience} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="internship" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {experiences
                  .filter((exp) => exp.type.toLowerCase() === "internship")
                  .map((experience) => (
                    <ExperienceCard key={experience.id} experience={experience} />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="placement" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {experiences
                  .filter((exp) => exp.type.toLowerCase() === "placement")
                  .map((experience) => (
                    <ExperienceCard key={experience.id} experience={experience} />
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}

