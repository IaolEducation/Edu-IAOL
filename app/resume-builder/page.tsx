import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Download, Edit, ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Resume Builder | NIT Hamirpur",
  description: "Create professional resumes tailored for your dream job with our resume builder",
}

export default function ResumeBuilderPage() {
  return (
    <div className="container px-4 md:px-6 py-8 md:py-12">
      <Button asChild variant="ghost" className="mb-6">
        <Link href="/" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </Button>

      <div className="flex flex-col gap-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Resume Builder</h1>
          <p className="text-muted-foreground">
            Create professional resumes tailored for your dream job with our easy-to-use resume builder
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Choose Template
              </CardTitle>
              <CardDescription>Select from professionally designed resume templates</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Our templates are designed to pass ATS systems and impress recruiters.
              </p>
              <Button className="w-full">Browse Templates</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-primary" />
                Fill Your Details
              </CardTitle>
              <CardDescription>Add your education, experience, and skills</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Our guided process makes it easy to add all relevant information.
              </p>
              <Button className="w-full" variant="outline">
                Start Building
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-primary" />
                Download & Share
              </CardTitle>
              <CardDescription>Get your resume in PDF format ready to share</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Download your resume in multiple formats or share directly with recruiters.
              </p>
              <Button className="w-full" variant="secondary">
                Learn More
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="bg-muted p-6 rounded-lg mt-4">
          <h2 className="text-xl font-bold mb-4">Coming Soon!</h2>
          <p className="text-muted-foreground">
            We're currently developing this feature. Check back soon for our fully functional resume builder that will
            help you create professional resumes tailored for your target companies.
          </p>
        </div>
      </div>
    </div>
  )
}

