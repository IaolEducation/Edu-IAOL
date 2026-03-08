"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export default function CompanySearch() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [searchQuery, setSearchQuery] = useState("")

  // Initialize search query from URL params
  useEffect(() => {
    const query = searchParams.get("query") || ""
    setSearchQuery(query)
  }, [searchParams])

  // Create a new URLSearchParams instance and update the URL
  const createQueryString = (params: Record<string, string | null>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString())

    Object.entries(params).forEach(([key, value]) => {
      if (value === null) {
        newSearchParams.delete(key)
      } else {
        newSearchParams.set(key, value)
      }
    })

    return newSearchParams.toString()
  }

  // Handle search input
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const queryString = createQueryString({
      query: searchQuery || null,
    })
    router.push(`${pathname}?${queryString}`)
  }

  return (
    <div className="flex flex-col gap-4">
      <form className="flex gap-3 sm:gap-4" onSubmit={handleSearch}>
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search companies..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Button type="submit" variant="default" size="icon" className="shrink-0">
          <Search className="h-4 w-4" />
          <span className="sr-only">Search</span>
        </Button>
      </form>
    </div>
  )
}

