"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { db } from "@/lib/firebase"
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Lightbulb, ArrowRight, GraduationCap, BookOpen, Briefcase, Calendar } from "lucide-react"

const AUTHOR_TYPE_LABELS: Record<string, string> = {
  college_student: "College Student",
  student: "Student",
  professional: "Professional",
}

const AUTHOR_TYPE_ICONS: Record<string, React.ReactNode> = {
  college_student: <GraduationCap className="h-3 w-3" />,
  student: <BookOpen className="h-3 w-3" />,
  professional: <Briefcase className="h-3 w-3" />,
}

const AUDIENCE_LABELS: Record<string, string> = {
  student: "Exam Prep",
  college_student: "College Students",
  all: "Everyone",
}

interface AdvicePost {
  id: string
  title: string
  content: string
  category: string
  targetAudience: string
  authorName: string
  authorType: string
  createdAt: any
}

function getInitials(name: string) {
  return name.trim().split(" ").filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join("") || "?"
}

export default function AdviceSection() {
  const [posts, setPosts] = useState<AdvicePost[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<AdvicePost | null>(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const q = query(collection(db, "advice"), orderBy("createdAt", "desc"), limit(6))
        const snap = await getDocs(q)
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as AdvicePost))
        setPosts(data)
      } catch {
        // silently fail — advice is optional on home
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  if (!loading && posts.length === 0) return null

  return (
    <section className="container px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Lightbulb className="h-4.5 w-4.5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Community Advice</h2>
            <p className="text-sm text-muted-foreground">Tips from students &amp; professionals</p>
          </div>
        </div>
        <Button asChild variant="ghost" size="sm" className="shrink-0">
          <Link href="/advice" className="flex items-center gap-1">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-5 space-y-3 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
              <div className="h-3 bg-muted rounded" />
              <div className="h-3 bg-muted rounded w-4/5" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.slice(0, 6).map((post) => (
            <Card
              key={post.id}
              className="cursor-pointer hover:shadow-md transition-all hover:border-primary/40 group"
              onClick={() => setSelected(post)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </CardTitle>
                <div className="flex gap-1.5 flex-wrap">
                  <Badge variant="secondary" className="text-xs h-5">{post.category}</Badge>
                  <Badge variant="outline" className="text-xs h-5">
                    {AUDIENCE_LABELS[post.targetAudience] || post.targetAudience}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{post.content}</p>
                <div className="flex items-center gap-2 pt-1 border-t">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                    {getInitials(post.authorName)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{post.authorName}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      {AUTHOR_TYPE_ICONS[post.authorType]}
                      <span>{AUTHOR_TYPE_LABELS[post.authorType] || post.authorType}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Read full advice dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl leading-snug pr-6">{selected.title}</DialogTitle>
                <div className="flex gap-2 flex-wrap pt-1">
                  <Badge variant="secondary">{selected.category}</Badge>
                  <Badge variant="outline">{AUDIENCE_LABELS[selected.targetAudience] || selected.targetAudience}</Badge>
                </div>
              </DialogHeader>

              <div className="flex items-center gap-3 py-3 border-y">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
                  {getInitials(selected.authorName)}
                </div>
                <div>
                  <p className="font-medium text-sm">{selected.authorName}</p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    {AUTHOR_TYPE_ICONS[selected.authorType]}
                    <span>{AUTHOR_TYPE_LABELS[selected.authorType] || selected.authorType}</span>
                    {selected.createdAt?.toDate && (
                      <>
                        <span>·</span>
                        <Calendar className="h-3 w-3" />
                        <span>{selected.createdAt.toDate().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                {selected.content}
              </div>

              <div className="pt-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/advice">See all advice <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link>
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
