"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building, Briefcase, Users, Award } from "lucide-react"
import { getPlacementStats } from "@/lib/data-utils"
import { Skeleton } from "@/components/ui/skeleton"

export default function StatsSection() {
  const [stats, setStats] = useState({
    totalExperiences: 0,
    totalCompanies: 0,
    jobProfiles: 0,
    highestPackage: "₹0 LPA",
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        const statsData = await getPlacementStats()

        // Map the returned stats to the format expected by the component
        setStats({
          totalExperiences: statsData.totalPlacements,
          totalCompanies: Object.keys(statsData.companyCount).length,
          jobProfiles: Object.keys(statsData.companyTypeCount).length,
          highestPackage: `₹${statsData.maxPackage.toFixed(1)} LPA`,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
        // Set default values in case of error
        setStats({
          totalExperiences: 0,
          totalCompanies: 0,
          jobProfiles: 0,
          highestPackage: "₹0 LPA",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <section className="container px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight mb-3 sm:mb-4 md:mb-6">
        Placement Highlights
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2 sm:p-4 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Experiences</CardTitle>
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-2 sm:p-4 pt-0 sm:pt-0">
            {isLoading ? (
              <Skeleton className="h-6 sm:h-8 w-16 sm:w-20" />
            ) : (
              <>
                <div className="text-lg sm:text-xl md:text-2xl font-bold truncate">{stats.totalExperiences}+</div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Shared by alumni</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2 sm:p-4 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Companies</CardTitle>
            <Building className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-2 sm:p-4 pt-0 sm:pt-0">
            {isLoading ? (
              <Skeleton className="h-6 sm:h-8 w-16 sm:w-20" />
            ) : (
              <>
                <div className="text-lg sm:text-xl md:text-2xl font-bold truncate">{stats.totalCompanies}+</div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Recruiting from campus</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2 sm:p-4 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Job Profiles</CardTitle>
            <Briefcase className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-2 sm:p-4 pt-0 sm:pt-0">
            {isLoading ? (
              <Skeleton className="h-6 sm:h-8 w-16 sm:w-20" />
            ) : (
              <>
                <div className="text-lg sm:text-xl md:text-2xl font-bold truncate">{stats.jobProfiles}+</div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Diverse opportunities</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2 sm:p-4 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Highest Package</CardTitle>
            <Award className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-2 sm:p-4 pt-0 sm:pt-0">
            {isLoading ? (
              <Skeleton className="h-6 sm:h-8 w-16 sm:w-20" />
            ) : (
              <>
                <div className="text-lg sm:text-xl md:text-2xl font-bold truncate">{stats.highestPackage}</div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Top offer</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

