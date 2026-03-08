"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Briefcase, MapPin, Users, Search } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { getCompanies, getMockExperiences } from "@/lib/data-utils"
import { getCompanyLogo, getCompanyColor } from "@/lib/image-utils"

interface Company {
  id: string
  name: string
  logo: string
  type: string
  location: string
  experienceCount: number
  color: string
}

export default function CompanyList() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCompanies() {
      try {
        setLoading(true)

        // Use our data utility functions instead of direct Firestore queries
        const companyNames = await getCompanies()
        const experiences = await getMockExperiences() // This now returns approved experiences

        // Extract unique companies and count experiences for each
        const companyMap = new Map<string, Company>()

        // Initialize all companies from the company names list
        companyNames.forEach((companyName) => {
          companyMap.set(companyName, {
            id: companyName.toLowerCase().replace(/\s+/g, "-"),
            name: companyName,
            logo: getCompanyLogo(companyName),
            type: "Unknown",
            location: "Not specified",
            experienceCount: 0,
            color: getCompanyColor(companyName),
          })
        })

        // Count experiences for each company and update company details
        experiences.forEach((exp) => {
          if (!exp.company) return

          if (companyMap.has(exp.company)) {
            const company = companyMap.get(exp.company)!
            company.experienceCount += 1

            // Update company details if available
            if (exp.companyType) company.type = exp.companyType
            if (exp.location) company.location = exp.location
          } else {
            // In case there's a company in experiences that wasn't in the companies list
            companyMap.set(exp.company, {
              id: exp.company.toLowerCase().replace(/\s+/g, "-"),
              name: exp.company,
              logo: getCompanyLogo(exp.company),
              type: exp.companyType || "Unknown",
              location: exp.location || "Not specified",
              experienceCount: 1,
              color: getCompanyColor(exp.company),
            })
          }
        })

        // Convert to array and sort by experience count
        const companiesArray = Array.from(companyMap.values())
          .filter((company) => company.experienceCount > 0)
          .sort((a, b) => b.experienceCount - a.experienceCount)

        setCompanies(companiesArray)
        setFilteredCompanies(companiesArray)
      } catch (error) {
        console.error("Error fetching companies:", error)
        setCompanies([])
        setFilteredCompanies([])
      } finally {
        setLoading(false)
      }
    }

    fetchCompanies()
  }, [])

  // Filter companies when search term changes
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCompanies(companies)
    } else {
      const term = searchTerm.toLowerCase()
      const filtered = companies.filter(
        (company) =>
          company.name.toLowerCase().includes(term) ||
          company.type.toLowerCase().includes(term) ||
          company.location.toLowerCase().includes(term),
      )
      setFilteredCompanies(filtered)
    }
  }, [searchTerm, companies])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="relative w-full max-w-md mx-auto mb-6 animate-pulse">
          <div className="h-10 bg-muted rounded-md"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-24 bg-muted"></CardHeader>
              <CardContent className="py-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardContent>
              <CardFooter className="h-10 bg-muted"></CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search input */}
      <div className="relative w-full max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder="Search companies by name, type, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            onClick={() => setSearchTerm("")}
          >
            <span className="sr-only">Clear search</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </Button>
        )}
      </div>

      {filteredCompanies.length === 0 ? (
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>No Companies Found</CardTitle>
            <CardDescription>
              {searchTerm
                ? `No companies match "${searchTerm}". Try a different search term.`
                : "There are no companies with placement experiences yet."}
            </CardDescription>
          </CardHeader>
          <CardContent>{!searchTerm && <p>Be the first to share your placement experience!</p>}</CardContent>
          <CardFooter>
            {!searchTerm && (
              <Button asChild>
                <Link href="/submit">Share Your Experience</Link>
              </Button>
            )}
            {searchTerm && (
              <Button variant="outline" onClick={() => setSearchTerm("")}>
                Clear Search
              </Button>
            )}
          </CardFooter>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => (
            <Link
            key={company.id}
            href={`/companies/${company.id}`}
            onClick={(e) => e.preventDefault()} // Prevents navigation
            className="block transition-transform hover:scale-[1.02] cursor-default" // Optional: Changes cursor
          >
              <Card className="h-full flex flex-col overflow-hidden border-2 hover:border-primary/50">
                <CardHeader className="pb-2 flex flex-row items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-md overflow-hidden flex items-center justify-center"
                    style={{ backgroundColor: company.logo.includes("default") ? company.color : "#f4f4f5" }}
                  >
                    <Image
                      src={company.logo || "/companies/company.png"}
                      alt={company.name}
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <CardTitle className="text-lg line-clamp-1">{company.name}</CardTitle>
                    <CardDescription className="line-clamp-1">{company.type}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="pb-2 flex-grow">
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="line-clamp-1">{company.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="h-4 w-4 mr-1" />
                    <span>
                      {company.experienceCount} {company.experienceCount === 1 ? "Experience" : "Experiences"}
                    </span>
                  </div>
                </CardContent>
              
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

