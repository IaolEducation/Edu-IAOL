"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { db } from "@/lib/firebase"
import { collection, getDocs, query, orderBy, where, doc, setDoc, deleteDoc, getDoc } from "firebase/firestore"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, GraduationCap, BookOpen, Briefcase, Users, Lightbulb, UserPlus, UserCheck, Clock } from "lucide-react"
import { serverTimestamp } from "firebase/firestore"

type Filter = "all" | "college_student" | "student" | "professional"

interface CommunityUser {
  uid: string
  displayName: string
  email: string
  userType: string
  username?: string
  bio?: string
  createdAt?: any
  adviceCount: number
  followerCount: number
}

const TYPE_LABELS: Record<string, string> = { college_student: "College Student", student: "Exam Prep", professional: "Professional" }
const TYPE_ICONS: Record<string, React.ReactNode> = {
  college_student: <GraduationCap className="h-3.5 w-3.5" />,
  student: <BookOpen className="h-3.5 w-3.5" />,
  professional: <Briefcase className="h-3.5 w-3.5" />,
}
const TYPE_PILL: Record<string, string> = {
  college_student: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  student: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
  professional: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800",
}

function getInitials(name: string, email: string) {
  if (name?.trim()) return name.trim().split(" ").filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join("")
  return email?.[0]?.toUpperCase() || "U"
}
function avatarColor(uid: string) {
  const colors = ["bg-red-100 text-red-700","bg-orange-100 text-orange-700","bg-amber-100 text-amber-700","bg-emerald-100 text-emerald-700","bg-teal-100 text-teal-700","bg-blue-100 text-blue-700","bg-indigo-100 text-indigo-700","bg-violet-100 text-violet-700","bg-pink-100 text-pink-700","bg-cyan-100 text-cyan-700"]
  let h = 0; for (const c of uid) h = (h * 31 + c.charCodeAt(0)) % colors.length
  return colors[Math.abs(h)]
}

export default function CommunityPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<CommunityUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<Filter>("all")
  const [following, setFollowing] = useState<Set<string>>(new Set())
  const [loadingFollow, setLoadingFollow] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Users and advice are public reads; follows requires auth
        const [usersSnap, adviceSnap] = await Promise.all([
          getDocs(query(collection(db, "users"), orderBy("createdAt", "desc"))),
          getDocs(collection(db, "advice")),
        ])

        const adviceCountMap: Record<string, number> = {}
        adviceSnap.docs.forEach((d) => { const uid = d.data().authorId; if (uid) adviceCountMap[uid] = (adviceCountMap[uid] || 0) + 1 })

        // Follower counts — only fetch if authed (requires auth per rules)
        const followerCountMap: Record<string, number> = {}
        if (user) {
          try {
            const followsSnap = await getDocs(query(collection(db, "follows"), where("followerId", "!=", "")))
            followsSnap.docs.forEach((d) => { const uid = d.data().userId; if (uid) followerCountMap[uid] = (followerCountMap[uid] || 0) + 1 })
          } catch { /* skip follower counts for guests */ }
        }

        const list: CommunityUser[] = usersSnap.docs
          .map((d) => ({ uid: d.id, ...d.data(), adviceCount: adviceCountMap[d.id] || 0, followerCount: followerCountMap[d.id] || 0 } as CommunityUser))
          .filter((u) => u.userType && u.displayName && u.uid !== user?.uid)

        setUsers(list)

        // Load who current user follows
        if (user) {
          try {
            const myFollowsSnap = await getDocs(query(collection(db, "follows"), where("followerId", "==", user.uid)))
            setFollowing(new Set(myFollowsSnap.docs.map((d) => d.data().userId)))
          } catch { /* silent */ }
        }
      } catch (e) { console.error(e) }
      setLoading(false)
    }
    fetchAll()
  }, [user])

  const toggleFollow = async (targetUid: string) => {
    if (!user) { router.push("/auth/login"); return }
    setLoadingFollow((prev) => new Set(prev).add(targetUid))
    try {
      const followId = `${user.uid}_${targetUid}`
      const followRef = doc(db, "follows", followId)
      if (following.has(targetUid)) {
        await deleteDoc(followRef)
        setFollowing((prev) => { const s = new Set(prev); s.delete(targetUid); return s })
        setUsers((prev) => prev.map((u) => u.uid === targetUid ? { ...u, followerCount: Math.max(0, u.followerCount - 1) } : u))
      } else {
        await setDoc(followRef, { followerId: user.uid, userId: targetUid, createdAt: serverTimestamp() })
        setFollowing((prev) => new Set(prev).add(targetUid))
        setUsers((prev) => prev.map((u) => u.uid === targetUid ? { ...u, followerCount: u.followerCount + 1 } : u))
      }
    } catch (e) { console.error(e) }
    setLoadingFollow((prev) => { const s = new Set(prev); s.delete(targetUid); return s })
  }

  const filtered = users.filter((u) => {
    const name = u.displayName || u.email?.split("@")[0] || ""
    const uname = u.username || ""
    const email = u.email?.split("@")[0] || ""
    const matchSearch = !search || name.toLowerCase().includes(search.toLowerCase()) || uname.toLowerCase().includes(search.toLowerCase()) || email.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === "all" || u.userType === filter
    return matchSearch && matchFilter
  })

  const counts = { all: users.length || 0, college_student: users.filter((u) => u.userType === "college_student").length || 0, student: users.filter((u) => u.userType === "student").length || 0, professional: users.filter((u) => u.userType === "professional").length || 0 }

  return (
    <div className="container py-8 md:py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Users className="h-5 w-5" /></div>
          <h1 className="text-3xl font-bold tracking-tight">Community</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl">Browse all members — follow people, get inspired, and connect directly via their contact info.</p>
      </div>

      <div className="space-y-4 mb-6">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="all" className="gap-1.5"><Users className="h-3.5 w-3.5" /> All <Badge variant="secondary" className="ml-1 h-4 text-xs">{counts.all}</Badge></TabsTrigger>
            <TabsTrigger value="college_student" className="gap-1.5"><GraduationCap className="h-3.5 w-3.5" /> College <Badge variant="secondary" className="ml-1 h-4 text-xs">{counts.college_student}</Badge></TabsTrigger>
            <TabsTrigger value="student" className="gap-1.5"><BookOpen className="h-3.5 w-3.5" /> Exam Prep <Badge variant="secondary" className="ml-1 h-4 text-xs">{counts.student}</Badge></TabsTrigger>
            <TabsTrigger value="professional" className="gap-1.5"><Briefcase className="h-3.5 w-3.5" /> Professionals <Badge variant="secondary" className="ml-1 h-4 text-xs">{counts.professional}</Badge></TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by name, @username, or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {!search && filter === "all" && (
        <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
          <Clock className="h-3.5 w-3.5" /> Newest members first
        </div>
      )}

      <p className="text-sm text-muted-foreground mb-4">{loading ? "Loading members…" : `${filtered.length} member${filtered.length !== 1 ? "s" : ""}`}</p>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-5 space-y-3 animate-pulse">
              <div className="flex items-center gap-3"><div className="h-12 w-12 rounded-full bg-muted" /><div className="space-y-2 flex-1"><div className="h-3 bg-muted rounded w-3/4" /><div className="h-3 bg-muted rounded w-1/2" /></div></div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground"><Users className="h-12 w-12 mx-auto mb-3 opacity-20" /><p className="text-lg font-medium">No members found</p></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((u) => {
            const name = u.displayName || u.email?.split("@")[0] || "User"
            const initials = getInitials(name, u.email)
            const color = avatarColor(u.uid)
            const isFollowing = following.has(u.uid)
            const isLoadingThis = loadingFollow.has(u.uid)
            return (
              <Card
                key={u.uid}
                className="hover:shadow-md transition-shadow group cursor-pointer"
                onClick={() => {
                  if (!user) { router.push("/auth/login?redirectTo=/community"); return }
                  router.push(`/community/${u.uid}`)
                }}
              >
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold ${color}`}>{initials}</div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{name}</p>
                      {u.username && <p className="text-xs text-muted-foreground">@{u.username}</p>}
                      <div className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium mt-1 ${TYPE_PILL[u.userType] || ""}`}>
                        {TYPE_ICONS[u.userType]}{TYPE_LABELS[u.userType] || u.userType}
                      </div>
                    </div>
                  </div>
                  {u.bio && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{u.bio}</p>}
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span><span className="font-semibold text-foreground">{u.followerCount}</span> followers</span>
                    {u.adviceCount > 0 && <span className="flex items-center gap-1"><Lightbulb className="h-3 w-3" />{u.adviceCount} advice</span>}
                  </div>
                  {!user ? (
                    <Button size="sm" variant="outline" className="w-full gap-1.5 h-8 text-xs"
                      onClick={(e) => { e.stopPropagation(); router.push("/auth/login?redirectTo=/community") }}>
                      <UserPlus className="h-3.5 w-3.5" /> Sign in to Follow
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant={isFollowing ? "secondary" : "outline"}
                      className="w-full gap-1.5 h-8 text-xs"
                      disabled={isLoadingThis}
                      onClick={(e) => { e.stopPropagation(); toggleFollow(u.uid) }}
                    >
                      {isFollowing ? <><UserCheck className="h-3.5 w-3.5" /> Following</> : <><UserPlus className="h-3.5 w-3.5" /> Follow</>}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
