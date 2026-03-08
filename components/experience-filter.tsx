"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, X } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { getCompanies, getBranches, getYears, getPlacementTypes, getCompanyTypes } from "@/lib/data-utils"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

export default function ExperienceFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedBranch, setSelectedBranch] = useState<string>("all")
  const [selectedCompany, setSelectedCompany] = useState<string>("all")
  const [selectedYear, setSelectedYear] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedCompanyType, setSelectedCompanyType] = useState<string>("all")

  // State for dynamic data
  const [branches, setBranches] = useState<{ name: string; value: string }[]>([])
  const [companies, setCompanies] = useState<string[]>([])
  const [years, setYears] = useState<{ name: string; value: string }[]>([])
  const [loading, setLoading] = useState(true)

  // Count active filters
  const [activeFilterCount, setActiveFilterCount] = useState(0)

  // Fetch filter options from database
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        setLoading(true)

        // Fetch data in parallel
        const [companiesData, branchesData, yearsData] = await Promise.all([getCompanies(), getBranches(), getYears()])

        setCompanies(companiesData)
        setBranches(branchesData)
        setYears(yearsData)
      } catch (error) {
        console.error("Error fetching filter options:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFilterOptions()
  }, [])

  // Initialize filters from URL params
  useEffect(() => {
    const query = searchParams.get("query") || ""
    const branch = searchParams.get("branch") || "all"
    const company = searchParams.get("company") || "all"
    const year = searchParams.get("year") || "all"
    const type = searchParams.get("type") || "all"
    const companyType = searchParams.get("companyType") || "all"

    setSearchQuery(query)
    setSelectedBranch(branch)
    setSelectedCompany(company)
    setSelectedYear(year)
    setSelectedType(type)
    setSelectedCompanyType(companyType)

    // Count active filters
    let count = 0
    if (query) count++
    if (branch !== "all") count++
    if (company !== "all") count++
    if (year !== "all") count++
    if (type !== "all") count++
    if (companyType !== "all") count++
    setActiveFilterCount(count)
  }, [searchParams])

  // Create a new URLSearchParams instance and update the URL
  const createQueryString = (params: Record<string, string | null>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString())

    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === "all") {
        newSearchParams.delete(key)
      } else {
        newSearchParams.set(key, value)
      }
    })

    return newSearchParams.toString()
  }

  // Apply filters
  const applyFilters = () => {
    const queryString = createQueryString({
      query: searchQuery || null,
      branch: selectedBranch === "all" ? null : selectedBranch,
      company: selectedCompany === "all" ? null : selectedCompany,
      year: selectedYear === "all" ? null : selectedYear,
      type: selectedType === "all" ? null : selectedType,
      companyType: selectedCompanyType === "all" ? null : selectedCompanyType,
    })

    router.push(`${pathname}?${queryString}`)
  }

  // Reset filters
  const resetFilters = () => {
    setSearchQuery("")
    setSelectedBranch("all")
    setSelectedCompany("all")
    setSelectedYear("all")
    setSelectedType("all")
    setSelectedCompanyType("all")
    router.push(pathname)
  }

  // Handle search input
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const queryString = createQueryString({
      query: searchQuery || null,
      branch: selectedBranch === "all" ? null : selectedBranch,
      company: selectedCompany === "all" ? null : selectedCompany,
      year: selectedYear === "all" ? null : selectedYear,
      type: selectedType === "all" ? null : selectedType,
      companyType: selectedCompanyType === "all" ? null : selectedCompanyType,
    })
    router.push(`${pathname}?${queryString}`)
  }

  // Handle quick filters
  const handleQuickFilter = (filterType: string, value: string) => {
    let queryParams: Record<string, string | null> = {}

    switch (filterType) {
      case "branch":
        setSelectedBranch(value)
        queryParams = { branch: value === "all" ? null : value }
        break
      case "type":
        setSelectedType(value)
        queryParams = { type: value === "all" ? null : value }
        break
      case "company":
        setSelectedCompany(value)
        queryParams = { company: value === "all" ? null : value }
        break
      case "year":
        setSelectedYear(value)
        queryParams = { year: value === "all" ? null : value }
        break
      case "companyType":
        setSelectedCompanyType(value)
        queryParams = { companyType: value === "all" ? null : value }
        break
    }

    const queryString = createQueryString(queryParams)
    router.push(`${pathname}?${queryString}`)
  }

  // Clear a specific filter
  const clearFilter = (filterType: string) => {
    let queryParams: Record<string, string | null> = {}

    switch (filterType) {
      case "query":
        setSearchQuery("")
        queryParams = { query: null }
        break
      case "branch":
        setSelectedBranch("all")
        queryParams = { branch: null }
        break
      case "type":
        setSelectedType("all")
        queryParams = { type: null }
        break
      case "company":
        setSelectedCompany("all")
        queryParams = { company: null }
        break
      case "year":
        setSelectedYear("all")
        queryParams = { year: null }
        break
      case "companyType":
        setSelectedCompanyType("all")
        queryParams = { companyType: null }
        break
    }

    const queryString = createQueryString(queryParams)
    router.push(`${pathname}?${queryString}`)
  }

  // Get placement types
  const placementTypes = getPlacementTypes()

  // Get company types
  const companyTypes = getCompanyTypes()

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Search and Filter Bar */}
      <form className="flex flex-col sm:flex-row gap-3 sm:gap-4" onSubmit={handleSearch}>
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name, company or keyword..."
            className="pl-8 pr-10 h-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              onClick={() => clearFilter("query")}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Button type="submit" variant="default" className="shrink-0 px-3 sm:px-4">
            <Search className="h-4 w-4 mr-2 sm:mr-2" />
            <span className="hidden sm:inline">Search</span>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="shrink-0 px-3 sm:px-4">
                <Filter className="h-4 w-4 mr-2 sm:mr-2" />
                <span className="hidden sm:inline">Filter</span>
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filter Experiences</SheetTitle>
                <SheetDescription>Narrow down experiences based on your preferences</SheetDescription>
              </SheetHeader>

              <div className="py-6 space-y-6">
                {/* Branch Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Branch</label>
                  <Select value={selectedBranch} onValueChange={(value) => setSelectedBranch(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Branches</SelectItem>
                      {loading
                        ? Array(3)
                            .fill(0)
                            .map((_, i) => (
                              <div key={i} className="px-2 py-1.5">
                                <Skeleton className="h-4 w-full" />
                              </div>
                            ))
                        : branches.map((branch) => (
                            <SelectItem key={branch.value} value={branch.value}>
                              {branch.name}
                            </SelectItem>
                          ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Company Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company</label>
                  <Select value={selectedCompany} onValueChange={(value) => setSelectedCompany(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Companies</SelectItem>
                      {loading
                        ? Array(3)
                            .fill(0)
                            .map((_, i) => (
                              <div key={i} className="px-2 py-1.5">
                                <Skeleton className="h-4 w-full" />
                              </div>
                            ))
                        : companies.map((company) => (
                            <SelectItem key={company} value={company.toLowerCase().replace(/\s+/g, "-")}>
                              {company}
                            </SelectItem>
                          ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Year Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Year</label>
                  <Select value={selectedYear} onValueChange={(value) => setSelectedYear(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      {loading
                        ? Array(3)
                            .fill(0)
                            .map((_, i) => (
                              <div key={i} className="px-2 py-1.5">
                                <Skeleton className="h-4 w-full" />
                              </div>
                            ))
                        : years.map((year) => (
                            <SelectItem key={year.value} value={year.value}>
                              {year.name}
                            </SelectItem>
                          ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Placement Type Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Placement Type</label>
                  <Select value={selectedType} onValueChange={(value) => setSelectedType(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {placementTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Company Type Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company Type</label>
                  <Select value={selectedCompanyType} onValueChange={(value) => setSelectedCompanyType(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Company Types</SelectItem>
                      {companyTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <SheetFooter className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button variant="outline" onClick={resetFilters} type="button" className="w-full sm:w-auto">
                  Reset All
                </Button>
                <SheetClose asChild>
                  <Button onClick={applyFilters} className="w-full sm:w-auto">
                    Apply Filters
                  </Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </form>

      {/* Active Filters & Quick Filters */}
      <div className="flex flex-wrap gap-2">
        {/* Active Filters */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 w-full mb-2">
            {searchQuery && (
              <Badge variant="secondary" className="flex items-center gap-1 px-2 py-1">
                Search: {searchQuery.length > 15 ? `${searchQuery.substring(0, 15)}...` : searchQuery}
                <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1" onClick={() => clearFilter("query")}>
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove</span>
                </Button>
              </Badge>
            )}

            {selectedBranch !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1 px-2 py-1">
                Branch: {branches.find((b) => b.value === selectedBranch)?.name || selectedBranch}
                <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1" onClick={() => clearFilter("branch")}>
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove</span>
                </Button>
              </Badge>
            )}

            {selectedCompany !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1 px-2 py-1">
                Company:{" "}
                {companies.find((c) => c.toLowerCase().replace(/\s+/g, "-") === selectedCompany) || selectedCompany}
                <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1" onClick={() => clearFilter("company")}>
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove</span>
                </Button>
              </Badge>
            )}

            {selectedYear !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1 px-2 py-1">
                Year: {years.find((y) => y.value === selectedYear)?.name || selectedYear}
                <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1" onClick={() => clearFilter("year")}>
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove</span>
                </Button>
              </Badge>
            )}

            {selectedType !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1 px-2 py-1">
                Type: {placementTypes.find((t) => t.value === selectedType)?.name || selectedType}
                <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1" onClick={() => clearFilter("type")}>
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove</span>
                </Button>
              </Badge>
            )}

            {selectedCompanyType !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1 px-2 py-1">
                Company Type: {companyTypes.find((t) => t.value === selectedCompanyType)?.name || selectedCompanyType}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => clearFilter("companyType")}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove</span>
                </Button>
              </Badge>
            )}

            {activeFilterCount > 1 && (
              <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={resetFilters}>
                Clear All
              </Button>
            )}
          </div>
        )}

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-1.5 w-full overflow-x-auto pb-1">
          <Button
            variant={selectedType === "all" ? "secondary" : "outline"}
            size="sm"
            className="rounded-full text-xs h-7 px-3 whitespace-nowrap"
            onClick={() => handleQuickFilter("type", "all")}
          >
            All Types
          </Button>

          {placementTypes.map((type) => (
            <Button
              key={type.value}
              variant={selectedType === type.value ? "secondary" : "outline"}
              size="sm"
              className="rounded-full text-xs h-7 px-3 whitespace-nowrap"
              onClick={() => handleQuickFilter("type", type.value)}
            >
              {type.name}
            </Button>
          ))}
        </div>

        {!loading && companies.length > 0 && (
          <div className="flex flex-wrap gap-1.5 w-full overflow-x-auto pb-1 mt-1">
            <Button
              variant={selectedCompany === "all" ? "secondary" : "outline"}
              size="sm"
              className="rounded-full text-xs h-7 px-3 whitespace-nowrap"
              onClick={() => handleQuickFilter("company", "all")}
            >
              All Companies
            </Button>

            {companies.slice(0, 8).map((company) => (
              <Button
                key={company}
                variant={selectedCompany === company.toLowerCase().replace(/\s+/g, "-") ? "secondary" : "outline"}
                size="sm"
                className="rounded-full text-xs h-7 px-3 whitespace-nowrap"
                onClick={() => handleQuickFilter("company", company.toLowerCase().replace(/\s+/g, "-"))}
              >
                {company}
              </Button>
            ))}

            {companies.length > 8 && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-full text-xs h-7 px-3 whitespace-nowrap">
                    +{companies.length - 8} more
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[50vh]">
                  <SheetHeader>
                    <SheetTitle>All Companies</SheetTitle>
                  </SheetHeader>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 overflow-y-auto max-h-[calc(50vh-6rem)]">
                    <Button
                      variant={selectedCompany === "all" ? "secondary" : "outline"}
                      size="sm"
                      className="justify-start"
                      onClick={() => {
                        handleQuickFilter("company", "all")
                      }}
                    >
                      All Companies
                    </Button>
                    {companies.map((company) => (
                      <Button
                        key={company}
                        variant={
                          selectedCompany === company.toLowerCase().replace(/\s+/g, "-") ? "secondary" : "outline"
                        }
                        size="sm"
                        className="justify-start truncate"
                        onClick={() => {
                          handleQuickFilter("company", company.toLowerCase().replace(/\s+/g, "-"))
                        }}
                      >
                        {company}
                      </Button>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

