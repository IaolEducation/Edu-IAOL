"use client"

import CompanyList from "@/components/company-list"
import CompanySearch from "@/components/company-search"
import AuthGuard from "@/components/auth-guard"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

export default function CompaniesClientPage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="container px-4 md:px-6 py-8 md:py-12">
      <div className="flex flex-col gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
          <p className="text-muted-foreground">Search and explore companies that recruit from NIT Hamirpur</p>
        </div>

        {/* Preview for non-authenticated users - only show when not authenticated */}
        {!isAuthenticated && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                <CardTitle>Authentication Required</CardTitle>
              </div>
              <CardDescription>Login to access detailed company information and placement statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                This section contains valuable information about companies that recruit from NIT Hamirpur, including
                placement statistics, interview processes, and student experiences.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href={`/auth/login?redirectTo=${encodeURIComponent("/companies")}`}>Login to Access</Link>
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Protected content */}
        <AuthGuard returnUrl="/companies">
          <CompanySearch />
          <CompanyList />
        </AuthGuard>
      </div>
    </div>
  )
}

