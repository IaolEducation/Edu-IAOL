"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { db } from "@/lib/firebase"
import { collection, getDocs, query, orderBy, doc, setDoc, deleteDoc, where, serverTimestamp } from "firebase/firestore"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Lightbulb, Search, GraduationCap, BookOpen, Briefcase, Calendar, Bookmark, BookmarkCheck } from "lucide-react"

const ADVICE_CATEGORIES = [
  "All",
  "Interview Preparation",
  "Resume Tips",
  "Career Guidance",
  "Internship Tips",
  "Placement Strategy",
  "Study Strategy",
  "Networking",
  "Technical Skills",
  "Soft Skills",
  "General Advice",
]

const AUTHOR_TYPE_LABELS: Record<string, string> = {
  college_student: "College Student",
  student: "Student",
  professional: "Professional",
}

const AUTHOR_TYPE_ICONS: Record<string, React.ReactNode> = {
  college_student: <GraduationCap className="h-3.5 w-3.5" />,
  student: <BookOpen className="h-3.5 w-3.5" />,
  professional: <Briefcase className="h-3.5 w-3.5" />,
}

const AUDIENCE_LABELS: Record<string, string> = {
  student: "Exam Prep Students",
  college_student: "College Students",
  all: "All Students",
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
  status: string
}

function getInitials(name: string) {
  return name.trim().split(" ").filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join("")
}

export default function AdvicePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [posts, setPosts] = useState<AdvicePost[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [audienceFilter, setAudienceFilter] = useState("all")
  const [selectedPost, setSelectedPost] = useState<AdvicePost | null>(null)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const q = query(collection(db, "advice"), orderBy("createdAt", "desc"))
        const snap = await getDocs(q)
        const data: AdvicePost[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as AdvicePost))
        setPosts(data.filter((p) => p.status === "published"))
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  useEffect(() => {
    if (!user) return
    getDocs(query(collection(db, "saves"), where("userId", "==", user.uid), where("itemType", "==", "advice")))
      .then((snap) => setSavedIds(new Set(snap.docs.map((d) => d.data().itemId))))
      .catch(() => {})
  }, [user])

  const toggleSave = async (post: AdvicePost, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) { router.push("/auth/login"); return }
    setSavingId(post.id)
    try {
      const saveId = `${user.uid}_advice_${post.id}`
      if (savedIds.has(post.id)) {
        await deleteDoc(doc(db, "saves", saveId))
        setSavedIds((prev) => { const s = new Set(prev); s.delete(post.id); return s })
      } else {
        await setDoc(doc(db, "saves", saveId), {
          userId: user.uid, itemId: post.id, itemType: "advice",
          title: post.title, meta: `${post.category} · ${post.authorName}`,
          savedAt: serverTimestamp(),
        })
        setSavedIds((prev) => new Set(prev).add(post.id))
      }
    } catch { /* silent */ }
    setSavingId(null)
  }

  const filtered = posts.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.content.toLowerCase().includes(search.toLowerCase()) ||
      p.authorName.toLowerCase().includes(search.toLowerCase())
    const matchCat = categoryFilter === "All" || p.category === categoryFilter
    const matchAudience = audienceFilter === "all" || p.targetAudience === audienceFilter || p.targetAudience === "all"
    return matchSearch && matchCat && matchAudience
  })

  return (
    <div className="container py-8 md:py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Lightbulb className="h-5 w-5" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Community Advice</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Real guidance from college students and professionals who&apos;ve been there. Browse tips on interviews, career growth, placements, and more.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search advice, topics, or authors…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {ADVICE_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={audienceFilter} onValueChange={setAudienceFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="For" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Audiences</SelectItem>
            <SelectItem value="student">Exam Prep Students</SelectItem>
            <SelectItem value="college_student">College Students</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Count */}
      <p className="text-sm text-muted-foreground mb-4">
        {loading ? "Loading…" : `${filtered.length} piece${filtered.length !== 1 ? "s" : ""} of advice`}
      </p>

      {/* Posts grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-5 space-y-3 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded" />
                <div className="h-3 bg-muted rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Lightbulb className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="text-lg font-medium">No advice found</p>
          <p className="text-sm mt-1">Try adjusting your filters or search term.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <Card
              key={post.id}
              className="cursor-pointer hover:shadow-md transition-shadow hover:border-primary/30 group"
              onClick={() => setSelectedPost(post)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-snug group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </CardTitle>
                  <Button
                    variant="ghost" size="icon"
                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-primary"
                    disabled={savingId === post.id}
                    onClick={(e) => toggleSave(post, e)}
                  >
                    {savedIds.has(post.id) ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="flex gap-1.5 flex-wrap mt-1">
                  <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                  <Badge variant="outline" className="text-xs">
                    {AUDIENCE_LABELS[post.targetAudience] || post.targetAudience}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-3">{post.content}</p>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {getInitials(post.authorName || "?")}
                    </div>
                    <div>
                      <p className="text-xs font-medium">{post.authorName}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {AUTHOR_TYPE_ICONS[post.authorType]}
                        {AUTHOR_TYPE_LABELS[post.authorType] || post.authorType}
                      </div>
                    </div>
                  </div>
                  {post.createdAt?.toDate && (
                    <p className="text-xs text-muted-foreground">
                      {post.createdAt.toDate().toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Full post dialog */}
      <Dialog open={!!selectedPost} onOpenChange={(o) => !o && setSelectedPost(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedPost && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl leading-snug pr-6">{selectedPost.title}</DialogTitle>
                <div className="flex gap-2 flex-wrap pt-1">
                  <Badge variant="secondary">{selectedPost.category}</Badge>
                  <Badge variant="outline">{AUDIENCE_LABELS[selectedPost.targetAudience] || selectedPost.targetAudience}</Badge>
                </div>
              </DialogHeader>

              {/* Author */}
              <div className="flex items-center gap-3 py-3 border-y">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                  {getInitials(selectedPost.authorName || "?")}
                </div>
                <div>
                  <p className="font-medium text-sm">{selectedPost.authorName}</p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    {AUTHOR_TYPE_ICONS[selectedPost.authorType]}
                    {AUTHOR_TYPE_LABELS[selectedPost.authorType] || selectedPost.authorType}
                    {selectedPost.createdAt?.toDate && (
                      <>
                        <span>·</span>
                        <Calendar className="h-3 w-3" />
                        {selectedPost.createdAt.toDate().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                {selectedPost.content}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
