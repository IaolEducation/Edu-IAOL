import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Video, FileText, ArrowLeft, ExternalLink, Youtube, BookMarked, Globe } from "lucide-react"
import RequireLogin from "@/components/require-login"

export const metadata: Metadata = {
  title: "Resources | Eduiaol",
  description: "Access placement preparation resources, interview guides, and study materials",
}

export default function ResourcesPage() {
  return (
    <RequireLogin>
    <div className="container px-4 md:px-6 py-8 md:py-12">
      <Button asChild variant="ghost" className="mb-6">
        <Link href="/" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </Button>

      <div className="flex flex-col gap-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Placement Resources</h1>
          <p className="text-muted-foreground">
            Access curated resources to help you prepare for placements and ace your interviews
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookMarked className="h-5 w-5 text-primary" />
                Study Notes & Materials
              </CardTitle>
              <CardDescription>Access comprehensive study materials and notes</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <ExternalLink className="h-3.5 w-3.5" />
                  <a
                    href="https://drive.google.com/drive/folders/16WwCey8Ai8eZIox_YRGCLfs5L75tghfx"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    Company wise Questions
                  </a>
                </li>
              
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                Video Resources
              </CardTitle>
              <CardDescription>Best YouTube channels for tech and placement prep</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Youtube className="h-3.5 w-3.5 text-red-500" />
                  <a
                    href="https://www.youtube.com/c/takeUforward"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    Take U Forward (Striver)
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Youtube className="h-3.5 w-3.5 text-red-500" />
                  <a
                    href="https://www.youtube.com/c/GateSmashers"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    Gate Smashers
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Youtube className="h-3.5 w-3.5 text-red-500" />
                  <a
                    href="https://www.youtube.com/c/CSDojo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    CS Dojo
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Youtube className="h-3.5 w-3.5 text-red-500" />
                  <a
                    href="https://www.youtube.com/c/NeetCode"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    NeetCode
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Youtube className="h-3.5 w-3.5 text-red-500" />
                  <a
                    href="https://www.youtube.com/c/CodingNinjas"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    Coding Ninjas
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Youtube className="h-3.5 w-3.5 text-red-500" />
                  <a
                    href="https://www.youtube.com/c/SystemDesignInterview"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    System Design Interview
                  </a>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Coding Platforms
            </CardTitle>
            <CardDescription>
              Recommended platforms to practice coding and prepare for technical interviews
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
                <a href="https://leetcode.com/" target="_blank" rel="noopener noreferrer">
                  <span className="font-bold">LeetCode</span>
                  <span className="text-xs text-muted-foreground">Comprehensive DSA problems</span>
                </a>
              </Button>


              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
                <a href="https://codeforces.com/" target="_blank" rel="noopener noreferrer">
                  <span className="font-bold">Codeforces</span>
                  <span className="text-xs text-muted-foreground">Competitive programming</span>
                </a>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
                <a href="https://www.geeksforgeeks.org/" target="_blank" rel="noopener noreferrer">
                  <span className="font-bold">GeeksforGeeks</span>
                  <span className="text-xs text-muted-foreground">Comprehensive resources</span>
                </a>
              </Button>
              
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
                <a href="https://www.codingninjas.com/" target="_blank" rel="noopener noreferrer">
                  <span className="font-bold">Coding Ninjas</span>
                  <span className="text-xs text-muted-foreground">Structured learning paths</span>
                </a>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
                <a href="https://neetcode.io/" target="_blank" rel="noopener noreferrer">
                  <span className="font-bold">NeetCode</span>
                  <span className="text-xs text-muted-foreground">Curated problem lists</span>
                </a>
              </Button>

              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
                <a href="https://www.hackerrank.com/" target="_blank" rel="noopener noreferrer">
                  <span className="font-bold">HackerRank</span>
                  <span className="text-xs text-muted-foreground">Interview preparation</span>
                </a>
              </Button>

              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
                <a href="https://www.interviewbit.com/" target="_blank" rel="noopener noreferrer">
                  <span className="font-bold">InterviewBit</span>
                  <span className="text-xs text-muted-foreground">Company-specific prep</span>
                </a>
              </Button>

              

              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
                <a href="https://www.codechef.com/" target="_blank" rel="noopener noreferrer">
                  <span className="font-bold">CodeChef</span>
                  <span className="text-xs text-muted-foreground">Competitive coding</span>
                </a>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
                <a href="https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2" target="_blank" rel="noopener noreferrer">
                  <span className="font-bold">takeuforward</span>
                  <span className="text-xs text-muted-foreground"> Best Coding Tutorials for Free</span>
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

       

        <div className="bg-muted p-6 rounded-lg mt-4">
          <h2 className="text-xl font-bold mb-4">Resource Contributions</h2>
          <p className="text-muted-foreground mb-4">
            We're constantly updating our resources. If you have valuable materials to share with the Eduiaol
            community, please consider contributing.
          </p>
          <Button>Contribute Resources</Button>
        </div>
      </div>
    </div>
    </RequireLogin>
  )
}

