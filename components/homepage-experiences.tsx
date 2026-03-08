"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { getMockExperiences } from "@/lib/data-utils"
import { toast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { getCompanyLogo, getRandomProfileImage, getCompanyColor } from "@/lib/image-utils"

export default function HomepageExperiences() {
  const router = useRouter()
  const [experiences, setExperiences] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        setIsLoading(true)
        const approvedExperiences = await getMockExperiences()

        const recentExperiences = approvedExperiences
          .sort((a, b) => {
            const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0
            const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0
            return dateB - dateA
          })
          .slice(0, 3)

        setExperiences(recentExperiences)
      } catch (error) {
        console.error("Error loading experiences:", error)
        toast({
          title: "Error",
          description: "Failed to load experiences. Please try again.",
          variant: "destructive",
        })
        setExperiences([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchExperiences()
  }, [])

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="flex flex-col overflow-hidden">
            <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 sm:h-5 w-24 sm:w-32 mb-1" />
                    <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
                  </div>
                </div>
                <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-md" />
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-3 sm:p-4 pt-0 sm:pt-0">
              <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-3">
                <Skeleton className="h-4 sm:h-5 w-16 sm:w-20" />
                <Skeleton className="h-4 sm:h-5 w-20 sm:w-24" />
                <Skeleton className="h-4 sm:h-5 w-12 sm:w-16" />
              </div>
              <Skeleton className="h-3 sm:h-4 w-full mb-2" />
              <Skeleton className="h-3 sm:h-4 w-full mb-2" />
              <Skeleton className="h-3 sm:h-4 w-3/4" />
            </CardContent>
            <CardFooter className="p-3 sm:p-4">
              <Skeleton className="h-8 sm:h-9 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  if (experiences.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 text-muted-foreground">
        <h3 className="text-base sm:text-lg font-medium">No experiences shared yet</h3>
        <p className="mt-2 px-4 text-sm">Be the first to share your placement experience!</p>
      </div>
    )
  }

  function getCompanyTypeName(value: string): string {
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
const CompanyLogo = getCompanyLogo()
  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {experiences.map((experience) => (
        <Card key={experience.id} className="flex flex-col overflow-hidden">
          <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                                    <AvatarImage src={experience.profileImage || getRandomProfileImage()} alt={experience.studentName} />
                                    <AvatarFallback>{experience.studentName.substring(0, 2)}</AvatarFallback>
                                  </Avatar>
                <div>
                  <CardTitle className="text-sm sm:text-lg line-clamp-1">{experience.studentName}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm line-clamp-1">{experience.branch}</CardDescription>
                </div>
              </div>
              <Image
                src={CompanyLogo || "/placeholder.svg"}
                alt={`${experience.company} logo`}
                width={32}
                height={32}
                className="rounded-md h-8 w-8 sm:h-10 sm:w-10 object-contain"
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-3 sm:p-4 pt-0 sm:pt-0">
            <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-3">
              <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0 h-5">
                {experience.company}
              </Badge>
              <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 py-0 h-5">
                {experience.type}
              </Badge>
              <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0 h-5">
                {experience.year}
              </Badge>
              {experience.companyType && (
                <Badge
                  variant="outline"
                  className="text-[10px] sm:text-xs px-1.5 py-0 h-5 bg-blue-100 dark:bg-blue-900/30 nith-theme:bg-gold/20"
                >
                  {getCompanyTypeName(experience.companyType)}
                </Badge>
              )}
              {experience.role && (
                <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0 h-5 bg-primary/10">
                  {experience.role}
                </Badge>
              )}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 sm:line-clamp-4">
              {experience.excerpt}
            </p>
          </CardContent>
          <CardFooter className="p-3 sm:p-4">
            <Button
              variant="ghost"
              className="w-full h-8 sm:h-9 text-xs sm:text-sm"
              onClick={() => router.push(`/experiences/${experience.id}`)}
            >
              <div className="flex items-center justify-between w-full">
                <span>View Full Experience</span>
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </div>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}