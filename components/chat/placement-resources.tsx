"use client"

import type React from "react"

import { useState } from "react"
import { ChevronDown, ChevronUp, FileText, Briefcase, Building, GraduationCap, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ResourceSection {
  title: string
  icon: React.ReactNode
  content: React.ReactNode
}

export function PlacementResources() {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    resume: true,
    interview: false,
    technical: false,
    companies: false,
  })

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const sections: ResourceSection[] = [
    {
      title: "Resume Building",
      icon: <FileText className="h-5 w-5" />,
      content: (
        <div className="space-y-3">
          <p className="text-sm">A well-crafted resume is your first impression on recruiters. Here are some tips:</p>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>Keep it concise (1-2 pages)</li>
            <li>Highlight relevant skills and projects</li>
            <li>Quantify achievements where possible</li>
            <li>Tailor your resume for each application</li>
            <li>Include GitHub/portfolio links</li>
          </ul>
          <div className="pt-2">
            <h4 className="text-sm font-medium mb-2">Recommended Tools:</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="text-xs justify-start h-auto py-1.5">
                <span>Resume Templates</span>
                <ExternalLink className="ml-1 h-3 w-3" />
              </Button>
              <Button variant="outline" size="sm" className="text-xs justify-start h-auto py-1.5">
                <span>ATS Checker</span>
                <ExternalLink className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Interview Preparation",
      icon: <Briefcase className="h-5 w-5" />,
      content: (
        <div className="space-y-3">
          <p className="text-sm">Interviews assess both technical skills and cultural fit. Prepare for:</p>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>Behavioral questions (STAR method)</li>
            <li>Technical problem-solving</li>
            <li>System design discussions</li>
            <li>Company-specific questions</li>
          </ul>
          <div className="pt-2">
            <h4 className="text-sm font-medium mb-2">Common Questions:</h4>
            <div className="space-y-2">
              <div className="text-xs p-2 bg-muted rounded-md">
                "Tell me about a challenging project you worked on."
              </div>
              <div className="text-xs p-2 bg-muted rounded-md">"How do you handle conflicts in a team?"</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Technical Preparation",
      icon: <GraduationCap className="h-5 w-5" />,
      content: (
        <div className="space-y-3">
          <p className="text-sm">Focus on these key technical areas:</p>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>Data Structures & Algorithms</li>
            <li>System Design principles</li>
            <li>Programming languages (proficiency in at least 2)</li>
            <li>Database concepts</li>
            <li>Web technologies and frameworks</li>
          </ul>
          <div className="pt-2">
            <h4 className="text-sm font-medium mb-2">Practice Resources:</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="text-xs justify-start h-auto py-1.5">
                <span>LeetCode</span>
                <ExternalLink className="ml-1 h-3 w-3" />
              </Button>
              <Button variant="outline" size="sm" className="text-xs justify-start h-auto py-1.5">
                <span>HackerRank</span>
                <ExternalLink className="ml-1 h-3 w-3" />
              </Button>
              <Button variant="outline" size="sm" className="text-xs justify-start h-auto py-1.5">
                <span>GeeksforGeeks</span>
                <ExternalLink className="ml-1 h-3 w-3" />
              </Button>
              <Button variant="outline" size="sm" className="text-xs justify-start h-auto py-1.5">
                <span>InterviewBit</span>
                <ExternalLink className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Company Research",
      icon: <Building className="h-5 w-5" />,
      content: (
        <div className="space-y-3">
          <p className="text-sm">Research these aspects before applying:</p>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>Company culture and values</li>
            <li>Recent news and developments</li>
            <li>Products and services</li>
            <li>Interview process specifics</li>
            <li>Typical compensation packages</li>
          </ul>
          <div className="pt-2">
            <h4 className="text-sm font-medium mb-2">Research Tools:</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="text-xs justify-start h-auto py-1.5">
                <span>Glassdoor</span>
                <ExternalLink className="ml-1 h-3 w-3" />
              </Button>
              <Button variant="outline" size="sm" className="text-xs justify-start h-auto py-1.5">
                <span>LinkedIn</span>
                <ExternalLink className="ml-1 h-3 w-3" />
              </Button>
              <Button variant="outline" size="sm" className="text-xs justify-start h-auto py-1.5">
                <span>Blind</span>
                <ExternalLink className="ml-1 h-3 w-3" />
              </Button>
              <Button variant="outline" size="sm" className="text-xs justify-start h-auto py-1.5">
                <span>Company Website</span>
                <ExternalLink className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4 overflow-y-auto max-h-full">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold">Placement Resources</h3>
        <p className="text-sm text-muted-foreground">Everything you need for your placement preparation</p>
      </div>

      {sections.map((section) => (
        <Card key={section.title} className="overflow-hidden">
          <CardHeader
            className="p-4 cursor-pointer"
            onClick={() => toggleSection(section.title.toLowerCase().split(" ")[0])}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {section.icon}
                <CardTitle className="text-base">{section.title}</CardTitle>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                {expandedSections[section.title.toLowerCase().split(" ")[0]] ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
            <CardDescription className="text-xs mt-1">
              {section.title === "Resume Building" && "Create an impressive resume that stands out"}
              {section.title === "Interview Preparation" && "Ace your technical and behavioral interviews"}
              {section.title === "Technical Preparation" && "Strengthen your technical skills for assessments"}
              {section.title === "Company Research" && "Learn about potential employers and their processes"}
            </CardDescription>
          </CardHeader>
          <div
            className={cn(
              "transition-all duration-300 ease-in-out",
              expandedSections[section.title.toLowerCase().split(" ")[0]]
                ? "max-h-[500px] opacity-100"
                : "max-h-0 opacity-0 overflow-hidden",
            )}
          >
            <CardContent className="p-4 pt-0">{section.content}</CardContent>
          </div>
        </Card>
      ))}
    </div>
  )
}

