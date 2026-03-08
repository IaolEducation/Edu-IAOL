"use client"

import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"
import { useState, useEffect } from "react"

// Define the Experience type
type Experience = {
  id: number
  studentName: string
  branch: string
  company: string
  year: number
  type: string
  excerpt: string
  profileImage: string
}

// Mock function to simulate fetching experiences from a database
const getExperiences = async (): Promise<Experience[]> => {
  return new Promise((resolve) => {
    const experiences: Experience[] = [
      {
        id: 1,
        studentName: "Rahul Sharma",
        branch: "Computer Science",
        company: "Microsoft",
        year: 2023,
        type: "On-Campus",
        excerpt:
          "The interview process consisted of 3 technical rounds and 1 HR round. The technical rounds focused on data structures, algorithms, and system design...",
        profileImage: "/placeholder.svg?height=100&width=100",
      },
      {
        id: 4,
        studentName: "Sneha Mehta",
        branch: "Computer Science",
        company: "Microsoft",
        year: 2023,
        type: "On-Campus",
        excerpt:
          "Microsoft's interview was challenging but fair. I prepared by solving LeetCode problems and studying system design. The interviewers were friendly and focused on my problem-solving approach...",
        profileImage: "/placeholder.svg?height=100&width=100",
      },
      {
        id: 7,
        studentName: "Ankit Patel",
        branch: "Computer Science",
        company: "Microsoft",
        year: 2022,
        type: "On-Campus",
        excerpt:
          "I was selected for Microsoft through campus placements. The process included an online assessment followed by 3 technical interviews and 1 HR round. The questions were challenging but doable with good preparation...",
        profileImage: "/placeholder.svg?height=100&width=100",
      },
    ]
    setTimeout(() => resolve(experiences), 500) // Simulate network latency
  })
}

// Update the getExperiencesByCompany function to filter for approved experiences
// This is a mock function in the component, but we should update it to reflect our changes

// This would come from a database in a real implementation
const getExperiencesByCompany = async (companyName: string) => {
  try {
    // Get all experiences (this will already be filtered for non-admin users)
    const allExperiences = await getExperiences()

    // Filter by company name
    return allExperiences.filter((exp) => exp.company === companyName)
  } catch (error) {
    console.error("Error getting experiences by company:", error)
    return []
  }
}

// Then update the component to use this async function
export default function CompanyExperiences({ companyName }: { companyName: string }) {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadExperiences = async () => {
      try {
        setIsLoading(true)
        const companyExperiences = await getExperiencesByCompany(companyName)
        setExperiences(companyExperiences)
      } catch (error) {
        console.error("Error loading company experiences:", error)
        setExperiences([])
      } finally {
        setIsLoading(false)
      }
    }

    loadExperiences()
  }, [companyName])

  if (isLoading) {
    return <div className="text-center py-6">Loading experiences...</div>
  }

  if (experiences.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">No experiences shared yet</h3>
        <p className="text-muted-foreground mt-2">Be the first to share your experience with {companyName}</p>
        <Button asChild className="mt-4">
          <Link href="/submit">Share Your Experience</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Student Experiences</h2>
        <Button asChild variant="outline" size="sm">
          <Link href="/submit">Share Your Experience</Link>
        </Button>
      </div>

      <div className="grid gap-6">
        {experiences.map((experience) => (
          <Card key={experience.id}>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage src={experience.profileImage} alt={experience.studentName} />
                  <AvatarFallback>{experience.studentName.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{experience.studentName}</CardTitle>
                  <CardDescription>{experience.branch}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="secondary">{experience.type}</Badge>
                <Badge variant="outline">{experience.year}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{experience.excerpt}</p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="ghost" className="w-full">
                <Link href={`/experiences/${experience.id}`} className="flex items-center justify-between">
                  <span>Read Full Experience</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

