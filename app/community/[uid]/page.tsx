"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { db } from "@/lib/firebase"
import {
  doc, getDoc, collection, query, where, getDocs,
  setDoc, deleteDoc, serverTimestamp,
} from "firebase/firestore"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  GraduationCap, BookOpen, Briefcase, Phone, Instagram, Linkedin,
  Facebook, AtSign, Lightbulb, UserPlus, UserCheck, ArrowLeft,
  ExternalLink, Users, Calendar, MessageCircle, Mail, Building2, Megaphone,
} from "lucide-react"
import Link from "next/link"

const TYPE_LABELS: Record<string, string> = { college_student: "College Student", student: "Exam Prep Student", professional: "Professional" }
const TYPE_ICONS: Record<string, React.ReactNode> = {
  college_student: <GraduationCap className="h-4 w-4" />,
  student: <BookOpen className="h-4 w-4" />,
  professional: <Briefcase className="h-4 w-4" />,
}
const TYPE_COLORS: Record<string, string> = {
  college_student: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  student: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
  professional: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800",
}

function getInitials(name: string, email?: string) {
  if (name?.trim()) return name.trim().split(" ").filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join("")
  return email?.[0]?.toUpperCase() || "U"
}
function avatarColor(uid: string) {
  const colors = ["bg-red-100 text-red-700","bg-orange-100 text-orange-700","bg-amber-100 text-amber-700","bg-emerald-100 text-emerald-700","bg-teal-100 text-teal-700","bg-blue-100 text-blue-700","bg-indigo-100 text-indigo-700","bg-violet-100 text-violet-700","bg-pink-100 text-pink-700","bg-cyan-100 text-cyan-700"]
  let h = 0; for (const c of uid) h = (h * 31 + c.charCodeAt(0)) % colors.length
  return colors[Math.abs(h)]
}
function makeSocialUrl(val: string, platform: "instagram" | "linkedin" | "facebook") {
  if (!val) return ""
  if (val.startsWith("http")) return val
  if (platform === "instagram") return `https://instagram.com/${val.replace(/^@/, "")}`
  if (platform === "linkedin") return `https://linkedin.com/in/${val.replace(/^@/, "")}`
  if (platform === "facebook") return `https://facebook.com/${val.replace(/^@/, "")}`
  return val
}

interface UserProfile { uid: string; displayName: string; email?: string; userType: string; username?: string; bio?: string; phone?: string; instagram?: string; linkedin?: string; facebook?: string; publicEmail?: string; createdAt?: any }
interface AdvicePost { id: string; title: string; content: string; category: string; targetAudience: string; createdAt?: any }
interface Follower { uid: string; displayName: string; userType: string }
interface ExperienceItem { id: string; company: string; role?: string; type?: string; year?: number; excerpt?: string; branch?: string; package?: string }
interface UpdatePost { id: string; title: string; content: string; category: string; authorName: string; createdAt?: any }

export default function UserProfilePage() {
  const params = useParams()
  const uid = params.uid as string
  const router = useRouter()
  const { user: currentUser } = useAuth()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [advice, setAdvice] = useState<AdvicePost[]>([])
  const [experiences, setExperiences] = useState<ExperienceItem[]>([])
  const [updates, setUpdates] = useState<UpdatePost[]>([])
  const [followerCount, setFollowerCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [isFollowing, setIsFollowing] = useState(false)
  const [loadingFollow, setLoadingFollow] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedAdvice, setSelectedAdvice] = useState<AdvicePost | null>(null)
  const [followers, setFollowers] = useState<Follower[]>([])
  const [showFollowers, setShowFollowers] = useState(false)

  const isOwnProfile = currentUser?.uid === uid

  useEffect(() => {
    if (!uid) return
    const load = async () => {
      try {
        const [userSnap, adviceSnap, expSnap, updatesSnap, followersSnap, followingSnap] = await Promise.all([
          getDoc(doc(db, "users", uid)),
          getDocs(query(collection(db, "advice"), where("authorId", "==", uid))),
          getDocs(query(collection(db, "experiences"), where("uid", "==", uid))),
          getDocs(query(collection(db, "updates"), where("authorId", "==", uid))),
          getDocs(query(collection(db, "follows"), where("userId", "==", uid))),
          getDocs(query(collection(db, "follows"), where("followerId", "==", uid))),
        ])
        if (!userSnap.exists()) { router.replace("/community"); return }
        setProfile({ uid, ...userSnap.data() } as UserProfile)
        const adviceDocs = adviceSnap.docs
          .map((d) => ({ id: d.id, ...d.data() } as AdvicePost))
          .filter((d) => (d as AdvicePost & { status?: string }).status !== "archived")
        adviceDocs.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
        setAdvice(adviceDocs)
        const expDocs = expSnap.docs
          .map((d) => ({ id: d.id, ...d.data() } as ExperienceItem))
          .filter((e) => (e as ExperienceItem & { status?: string }).status === "approved")
        expDocs.sort((a, b) => ((b as ExperienceItem & { year?: number }).year ?? 0) - ((a as ExperienceItem & { year?: number }).year ?? 0))
        setExperiences(expDocs)
        const updateDocs = updatesSnap.docs
          .map((d) => ({ id: d.id, ...d.data() } as UpdatePost))
        updateDocs.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
        setUpdates(updateDocs)
        setFollowerCount(followersSnap.size)
        setFollowingCount(followingSnap.size)

        // Check if current user follows this profile
        if (currentUser) {
          const followSnap = await getDoc(doc(db, "follows", `${currentUser.uid}_${uid}`))
          setIsFollowing(followSnap.exists())
        }

        // Load follower details for the dialog
        const followerDetails: Follower[] = []
        for (const fDoc of followersSnap.docs.slice(0, 20)) {
          const fUid = fDoc.data().followerId
          try {
            const fSnap = await getDoc(doc(db, "users", fUid))
            if (fSnap.exists()) followerDetails.push({ uid: fUid, ...fSnap.data() } as Follower)
          } catch { /* skip */ }
        }
        setFollowers(followerDetails)
      } catch (e) { console.error(e) }
      setLoading(false)
    }
    load()
  }, [uid, currentUser, router])

  const toggleFollow = async () => {
    if (!currentUser) { router.push("/auth/login"); return }
    setLoadingFollow(true)
    try {
      const followRef = doc(db, "follows", `${currentUser.uid}_${uid}`)
      if (isFollowing) {
        await deleteDoc(followRef)
        setIsFollowing(false)
        setFollowerCount((p) => Math.max(0, p - 1))
      } else {
        await setDoc(followRef, { followerId: currentUser.uid, userId: uid, createdAt: serverTimestamp() })
        setIsFollowing(true)
        setFollowerCount((p) => p + 1)
      }
    } catch (e) { console.error(e) }
    setLoadingFollow(false)
  }

  if (loading) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )

  if (!profile) return null

  const name = profile.displayName || profile.email?.split("@")[0] || "User"
  const initials = getInitials(name, profile.email)
  const color = avatarColor(uid)

  return (
    <div className="container max-w-3xl py-8 md:py-12 space-y-6">
      {/* Back */}
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-1.5 -ml-2">
        <ArrowLeft className="h-4 w-4" /> Back to Community
      </Button>

      {/* ── Profile Card ── */}
      <Card>
        <CardContent className="pt-6 pb-6">
          <div className="flex items-start gap-5">
            <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-2xl font-bold ${color}`}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h1 className="text-2xl font-bold">{name}</h1>
                  {profile.username && <p className="text-sm text-muted-foreground">@{profile.username}</p>}
                  <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium mt-2 ${TYPE_COLORS[profile.userType] || ""}`}>
                    {TYPE_ICONS[profile.userType]}{TYPE_LABELS[profile.userType] || profile.userType}
                  </div>
                </div>
                {!isOwnProfile && (
                  <Button
                    onClick={toggleFollow}
                    disabled={loadingFollow}
                    variant={isFollowing ? "secondary" : "default"}
                    className="gap-2 shrink-0"
                  >
                    {isFollowing ? <><UserCheck className="h-4 w-4" /> Following</> : <><UserPlus className="h-4 w-4" /> Follow</>}
                  </Button>
                )}
                {isOwnProfile && (
                  <Button asChild variant="outline" size="sm" className="gap-1.5">
                    <Link href="/profile">Edit Profile</Link>
                  </Button>
                )}
              </div>
              {profile.bio && <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{profile.bio}</p>}

              {/* Stats */}
              <div className="mt-4 flex items-center gap-5 flex-wrap">
                <button className="text-sm hover:text-primary transition-colors" onClick={() => setShowFollowers(true)}>
                  <span className="font-bold text-foreground">{followerCount}</span> <span className="text-muted-foreground">followers</span>
                </button>
                <span className="text-sm"><span className="font-bold">{followingCount}</span> <span className="text-muted-foreground">following</span></span>
                <span className="text-sm"><span className="font-bold">{advice.length}</span> <span className="text-muted-foreground">advice posts</span></span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Contact Info ── */}
      {(profile.phone || profile.instagram || profile.linkedin || profile.facebook || profile.publicEmail) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><MessageCircle className="h-4 w-4" /> Contact &amp; Connect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile.phone && (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 dark:bg-green-950 text-green-600"><Phone className="h-4 w-4" /></div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone / WhatsApp</p>
                  <a href={`tel:${profile.phone}`} className="text-sm font-medium hover:text-primary transition-colors">{profile.phone}</a>
                  <a href={`https://wa.me/${profile.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="ml-2 text-xs text-green-600 hover:underline">WhatsApp ↗</a>
                </div>
              </div>
            )}
            {profile.instagram && (
              <>
                {profile.phone && <Separator />}
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-pink-50 dark:bg-pink-950 text-pink-600"><Instagram className="h-4 w-4" /></div>
                  <div>
                    <p className="text-xs text-muted-foreground">Instagram</p>
                    <a href={makeSocialUrl(profile.instagram, "instagram")} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
                      {profile.instagram.startsWith("http") ? "Open Profile" : `@${profile.instagram.replace(/^@/, "")}`} <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </>
            )}
            {profile.linkedin && (
              <>
                <Separator />
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700"><Linkedin className="h-4 w-4" /></div>
                  <div>
                    <p className="text-xs text-muted-foreground">LinkedIn</p>
                    <a href={makeSocialUrl(profile.linkedin, "linkedin")} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
                      {profile.linkedin.startsWith("http") ? "Open Profile" : profile.linkedin} <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </>
            )}
            {profile.facebook && (
              <>
                <Separator />
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600"><Facebook className="h-4 w-4" /></div>
                  <div>
                    <p className="text-xs text-muted-foreground">Facebook</p>
                    <a href={makeSocialUrl(profile.facebook, "facebook")} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
                      {profile.facebook.startsWith("http") ? "Open Profile" : profile.facebook} <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </>
            )}
            {profile.publicEmail && (
              <>
                <Separator />
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950 text-red-600"><Mail className="h-4 w-4" /></div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <a href={`mailto:${profile.publicEmail}?subject=Query from Eduiaol`} className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
                      {profile.publicEmail} <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Experiences ── */}
      {experiences.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" /> Experiences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {experiences.map((exp) => (
                <Link key={exp.id} href={`/experiences/${exp.id}`} className="block rounded-lg border p-4 hover:bg-muted/50 hover:border-primary/30 transition-all group text-left">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-medium text-sm group-hover:text-primary transition-colors">{exp.company}</h3>
                    {exp.role && <p className="text-xs text-muted-foreground">{exp.role}</p>}
                  </div>
                  {exp.excerpt && <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{exp.excerpt}</p>}
                  <div className="flex gap-2 flex-wrap">
                    {exp.type && <Badge variant="outline" className="text-xs">{exp.type}</Badge>}
                    {exp.year && <Badge variant="secondary" className="text-xs">{exp.year}</Badge>}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!profile.phone && !profile.instagram && !profile.linkedin && !profile.facebook && !profile.publicEmail && !isOwnProfile && (
        <Card className="border-dashed">
          <CardContent className="py-6 text-center text-sm text-muted-foreground">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
            {name} hasn&apos;t added contact info yet.
          </CardContent>
        </Card>
      )}
      {isOwnProfile && !profile.phone && !profile.instagram && !profile.linkedin && !profile.facebook && !profile.publicEmail && (
        <Card className="border-dashed border-primary/30 bg-primary/5">
          <CardContent className="py-5 flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">Add your contact info so people can reach you.</p>
            <Button asChild size="sm" variant="outline"><Link href="/profile">Add Contact Info</Link></Button>
          </CardContent>
        </Card>
      )}

      {/* ── Advice Posts ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Lightbulb className="h-4 w-4 text-primary" /> Advice by {name}</CardTitle>
        </CardHeader>
        <CardContent>
          {advice.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm"><Lightbulb className="h-10 w-10 mx-auto mb-2 opacity-20" />No advice posted yet.</div>
          ) : (
            <div className="space-y-3">
              {advice.map((post) => (
                <button key={post.id} className="w-full text-left rounded-lg border p-4 hover:bg-muted/50 hover:border-primary/30 transition-all group" onClick={() => setSelectedAdvice(post)}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
                    <Badge variant="secondary" className="text-xs shrink-0">{post.category}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{post.content}</p>
                  {post.createdAt?.toDate && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {post.createdAt.toDate().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Updates ── */}
      {updates.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Megaphone className="h-4 w-4 text-primary" /> Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {updates.map((up) => (
                <div key={up.id} className="rounded-lg border p-4 text-left">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-medium text-sm">{up.title}</h3>
                    <Badge variant="outline" className="text-xs capitalize shrink-0">{up.category.replace("_", " ")}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-3">{up.content}</p>
                  {up.createdAt?.toDate && (
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {up.createdAt.toDate().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Advice full dialog */}
      <Dialog open={!!selectedAdvice} onOpenChange={(o) => !o && setSelectedAdvice(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedAdvice && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl leading-snug pr-6">{selectedAdvice.title}</DialogTitle>
                <div className="flex gap-2 pt-1"><Badge variant="secondary">{selectedAdvice.category}</Badge></div>
              </DialogHeader>
              <div className="flex items-center gap-3 py-3 border-y">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold shrink-0 ${color}`}>{initials}</div>
                <div><p className="text-sm font-medium">{name}</p><p className="text-xs text-muted-foreground">{TYPE_LABELS[profile.userType]}</p></div>
              </div>
              <div className="text-sm leading-relaxed whitespace-pre-wrap">{selectedAdvice.content}</div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Followers dialog */}
      <Dialog open={showFollowers} onOpenChange={setShowFollowers}>
        <DialogContent className="max-w-sm max-h-[70vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Users className="h-4 w-4" /> Followers ({followerCount})</DialogTitle></DialogHeader>
          {followers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No followers yet.</p>
          ) : (
            <div className="space-y-3">
              {followers.map((f) => {
                const fn = f.displayName || "User"
                const fc = avatarColor(f.uid)
                const fi = getInitials(fn)
                return (
                  <button key={f.uid} className="w-full flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 text-left" onClick={() => { setShowFollowers(false); router.push(`/community/${f.uid}`) }}>
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${fc}`}>{fi}</div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{fn}</p>
                      <p className="text-xs text-muted-foreground">{TYPE_LABELS[f.userType] || f.userType}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
