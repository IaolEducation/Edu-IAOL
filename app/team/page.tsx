import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Github, Linkedin, Twitter, Users, Zap, Cpu, FileText, Sparkles } from "lucide-react"
import RequireLogin from "@/components/require-login"

export const metadata: Metadata = {
  title: "Our Team | Eduiaol",
  description: "Meet the team behind Eduiaol",
}

interface TeamMember {
  name: string
  role: string
  bio: string
  image: string
  social: {
    linkedin?: string
    twitter?: string
    github?: string
  }
}

const teamMembers: TeamMember[] = [
  {
    name: "Talib Hassan",
    role: "Full Stack Developer",
    bio: "Talib is a MERN stack developer and a software engineer who has designed and built multiple web applications, demonstrating his expertise in both frontend and backend development.",
    image: "/Haseena.jpeg",
    social: {
      linkedin: "https://www.linkedin.com/in/talib-hassan-32b56222b/",
      // twitter: "https://twitter.com",
      github: "https://github.com/lovezan",
    },
  },
  {
    name: "Ayush Shah",
    role: "Frontend Developer",
    bio: "Ayush is a collaborative frontend developer with a strong understanding of the full stack, translating design concepts into elegant and intuitive web interfaces. He prioritizes user-centric development, ensuring accessibility and a smooth user journey, using technologies like ReactJS, NextJS, JavaScript, and Node.js.",
    image: "/Ayush.jpeg",
    social: {
      linkedin: "https://www.linkedin.com/in/ayush-shah-106144229/",
      // twitter: "https://twitter.com",
      github: "https://github.com/dashboard",
    },
  },
  {
    name: "Hubed Singh Kaushal",
    role: "Frontend Developer",
    bio: "Hubed is a skilled frontend developer specializing in React.js and Next.js, crafting sleek, responsive web apps. A co-founder passionate about clean code and seamless user experiences.",
    image: "/Hubed.jpeg",
    social: {
      linkedin: "http://linkedin.com/in/hubedsinghk",
      // twitter: "https://twitter.com",
      github: "https://github.com/hubedsingh",
    },
  },
  {
    name: "Sumit Kumar Gautam",
    role: "Backend Developer",
    bio: "Sumit is a skilled backend developer with expertise in building robust and scalable systems. He leverages Node.js, Express, Python, Mongoose, and Google Auth to create efficient server-side solutions, ensuring seamless functionality for web applications. Additionally he also has knowledge of Reactjs and Nextjs.",
    image: "/Sumit.jpeg",
    social: {
      linkedin: "https://www.linkedin.com/in/sumit-kumar-270094228",
      github: "https://github.com/SumitKumar2002",
    },
  },
  {
    name: "Kundan Khirade",
    role: "UI/UX Designer",
    bio: "Kundan is an experienced designer who has crafted intuitive and visually engaging interfaces for a variety of digital products. He focuses on creating seamless, accessible, and user-friendly designs that enhance user experiences.",
    image: "/Kundan.jpeg",
    social: {
      linkedin: "https://www.linkedin.com/in/kundankhirade/",
    //   github: "https://github.com/SumitKumar2002",
    },
  },
 
 
]

export default function TeamPage() {
  return (
    <RequireLogin>
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-background to-background/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-6">
              <Users className="h-4 w-4" />
              <span>Our Team</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Meet the People Behind <span className="text-primary">Eduiaol</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
            We're a dedicated team building connections between students and alumni for shared placement insights and career guidance.
            </p>
          </div>
        </div>
      </section>

           {/* Team Members Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <Card
                key={index}
                className="overflow-hidden border border-border/50 bg-secondary/10 hover:border-primary/30 transition-colors"
              >
                <div className="flex justify-center mt-6">
                  <div className="w-24 h-24 relative overflow-hidden rounded-full bg-primary/5">
                    <Image src={member.image || "/placeholder.svg"} alt={member.name} fill className="object-cover rounded-full" />
                  </div>
                </div>
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                  <p className="text-primary font-medium mb-3">{member.role}</p>
                  <p className="text-muted-foreground text-sm mb-4">{member.bio}</p>
                  <div className="flex justify-center gap-3">
                    {member.social.linkedin && (
                      <Link href={member.social.linkedin} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                          <Linkedin className="h-4 w-4" />
                          <span className="sr-only">LinkedIn</span>
                        </Button>
                      </Link>
                    )}
                    {member.social.twitter && (
                      <Link href={member.social.twitter} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                          <Twitter className="h-4 w-4" />
                          <span className="sr-only">Twitter</span>
                        </Button>
                      </Link>
                    )}
                    {member.social.github && (
                      <Link href={member.social.github} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                          <Github className="h-4 w-4" />
                          <span className="sr-only">GitHub</span>
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
    </RequireLogin>
  )
}