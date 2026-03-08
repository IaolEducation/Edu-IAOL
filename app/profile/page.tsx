"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import type { UserType } from "@/contexts/auth-context"
import { db, auth, saveUpdateToFirestore } from "@/lib/firebase"
import { doc, getDoc, collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, deleteDoc, orderBy, Timestamp } from "firebase/firestore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import RequireLogin from "@/components/require-login"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  GraduationCap, BookOpen, Briefcase, User, Mail, CheckCircle2, AlertCircle,
  Trash2, Lightbulb, Upload, ArrowRight, Clock, Phone, Instagram, Linkedin,
  Facebook, AtSign, Save, Users, ExternalLink, Settings, Building,
  Calendar, Award, Plus, Pencil, MoreVertical, Archive, ArchiveRestore,
  Bookmark, BookmarkCheck, Megaphone, MessageCircle, Image as ImageIcon,
  Link2, File, FileText,
} from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"

const USER_TYPE_LABELS: Record<UserType, string> = {
  college_student: "College Student",
  student: "Student (Exam Prep)",
  professional: "Professional",
}
const USER_TYPE_DESCRIPTIONS: Record<UserType, string> = {
  college_student: "Placement, internships, campus recruitment",
  student: "JEE, NEET, entrance exam preparation",
  professional: "Working professional — share experience, mentor",
}
const USER_TYPE_ICONS: Record<UserType, React.ReactNode> = {
  college_student: <GraduationCap className="h-5 w-5" />,
  student: <BookOpen className="h-5 w-5" />,
  professional: <Briefcase className="h-5 w-5" />,
}
const TYPE_PILL: Record<string, string> = {
  college_student: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  student: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
  professional: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800",
}
const ADVICE_CATEGORIES = [
  "Interview Preparation", "Resume Tips", "Career Guidance", "Internship Tips",
  "Placement Strategy", "Study Strategy", "Networking", "Technical Skills", "Soft Skills", "General Advice",
]

interface AdvicePost { id: string; title: string; content: string; category: string; targetAudience: string; authorName: string; authorType: string; createdAt: any; status: string }
interface Experience { id: any; studentName: string; branch: string; company: string; type: string; year: number; role?: string; package?: string; excerpt: string; companyType?: string }
interface SavedItem { id: string; itemId: string; itemType: "advice" | "experience"; title: string; savedAt: any; meta?: string }
interface UpdatePost { id: string; title: string; content: string; category: string; authorName: string; createdAt: any }
interface SharedResource { id: string; title: string; description?: string; url?: string; fileUrl?: string; fileType?: "image" | "pdf" | "doc" | "other"; fileName?: string; type: "link" | "file"; category: string; createdAt: Timestamp | null }

function getInitials(name: string | null | undefined, email: string | null | undefined): string {
  if (name?.trim()) return name.trim().split(" ").filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join("")
  if (email) return email[0].toUpperCase()
  return "U"
}
function makeSocialUrl(val: string, platform: "instagram" | "linkedin" | "facebook") {
  if (!val) return ""
  if (val.startsWith("http")) return val
  if (platform === "instagram") return `https://instagram.com/${val.replace(/^@/, "")}`
  if (platform === "linkedin") return `https://linkedin.com/in/${val.replace(/^@/, "")}`
  if (platform === "facebook") return `https://facebook.com/${val.replace(/^@/, "")}`
  return val
}

function ProfileContent() {
  const { user, updateUserType, updateDisplayName, updateContactInfo, deleteAccount } = useAuth()
  const router = useRouter()

  // Contact info state
  const [contactLoaded, setContactLoaded] = useState(false)
  const [phone, setPhone] = useState("")
  const [username, setUsername] = useState("")
  const [bio, setBio] = useState("")
  const [instagram, setInstagram] = useState("")
  const [linkedin, setLinkedin] = useState("")
  const [facebook, setFacebook] = useState("")
  const [publicEmail, setPublicEmail] = useState("")
  const [savingContact, setSavingContact] = useState(false)

  // Name editing
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(user?.displayName || "")
  const [savingName, setSavingName] = useState(false)

  // Stats
  const [followerCount, setFollowerCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)

  // Switch type
  const [switchingType, setSwitchingType] = useState(false)

  // Delete
  const [deletePassword, setDeletePassword] = useState("")
  const [deleting, setDeleting] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const providers = auth.currentUser?.providerData?.map((p) => p.providerId) ?? []
  const isEmailPasswordUser = providers.includes("password")
  const isGoogleUser = providers.includes("google.com")

  // Advice
  const [adviceTitle, setAdviceTitle] = useState("")
  const [adviceContent, setAdviceContent] = useState("")
  const [adviceCategory, setAdviceCategory] = useState("")
  const [adviceTarget, setAdviceTarget] = useState("student")
  const [uploadingAdvice, setUploadingAdvice] = useState(false)
  const [myAdvice, setMyAdvice] = useState<AdvicePost[]>([])
  const [loadingAdvice, setLoadingAdvice] = useState(false)
  const [selectedAdvice, setSelectedAdvice] = useState<AdvicePost | null>(null)
  const [showAdviceForm, setShowAdviceForm] = useState(false)
  const [editingPost, setEditingPost] = useState<AdvicePost | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")
  const [editCategory, setEditCategory] = useState("")
  const [editTarget, setEditTarget] = useState("student")
  const [savingEdit, setSavingEdit] = useState(false)

  // Experiences
  const [myExperiences, setMyExperiences] = useState<Experience[]>([])
  const [loadingExp, setLoadingExp] = useState(false)

  // Saved items
  const [savedItems, setSavedItems] = useState<SavedItem[]>([])
  const [loadingSaved, setLoadingSaved] = useState(false)

  // Profile content view: All | Archived | Saved (side toggle)
  const [profileViewMode, setProfileViewMode] = useState<"all" | "archived" | "saved">("all")

  // Updates (exam, education tech, etc.)
  const [myUpdates, setMyUpdates] = useState<UpdatePost[]>([])
  const [loadingUpdates, setLoadingUpdates] = useState(false)
  const [showUpdateForm, setShowUpdateForm] = useState(false)
  const [updateTitle, setUpdateTitle] = useState("")
  const [updateContent, setUpdateContent] = useState("")
  const [updateCategory, setUpdateCategory] = useState<"exam_update" | "education_tech" | "general">("general")
  const [uploadingUpdate, setUploadingUpdate] = useState(false)

  const [mySharedResources, setMySharedResources] = useState<SharedResource[]>([])
  const [loadingSharedResources, setLoadingSharedResources] = useState(false)

  const canUploadAdvice = true // All users (student, college_student, professional) can post advice

  // Load shared resources
  useEffect(() => {
    if (!user) return
    setLoadingSharedResources(true)
    getDocs(query(collection(db, "shared_resources"), where("authorId", "==", user.uid), orderBy("createdAt", "desc")))
      .then((snap) => {
        setMySharedResources(snap.docs.map((d) => ({ id: d.id, ...d.data() } as SharedResource)))
      })
      .catch(() => {/* silent */})
      .finally(() => setLoadingSharedResources(false))
  }, [user])

  // Load all data
  useEffect(() => {
    if (!user) return
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid))
        if (snap.exists()) {
          const d = snap.data()
          setPhone(d.phone || "")
          setUsername(d.username || "")
          setBio(d.bio || "")
          setInstagram(d.instagram || "")
          setLinkedin(d.linkedin || "")
          setFacebook(d.facebook || "")
          setPublicEmail(d.publicEmail || "")
        }
      } catch { /* silent */ }
      setContactLoaded(true)
      try {
        const [fwSnap, fgSnap] = await Promise.all([
          getDocs(query(collection(db, "follows"), where("userId", "==", user.uid))),
          getDocs(query(collection(db, "follows"), where("followerId", "==", user.uid))),
        ])
        setFollowerCount(fwSnap.size)
        setFollowingCount(fgSnap.size)
      } catch { /* silent */ }
    }
    load()
  }, [user])

  // Load advice
  useEffect(() => {
    if (!user) return
    setLoadingAdvice(true)
    getDocs(query(collection(db, "advice"), where("authorId", "==", user.uid)))
      .then((snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as AdvicePost))
        docs.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
        setMyAdvice(docs)
      })
      .catch(() => {/* silent */})
      .finally(() => setLoadingAdvice(false))
  }, [user])

  // Load experiences
  useEffect(() => {
    if (!user) return
    setLoadingExp(true)
    getDocs(query(collection(db, "experiences"), where("uid", "==", user.uid)))
      .then((snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Experience))
        setMyExperiences(docs)
      })
      .catch(() => {/* silent */})
      .finally(() => setLoadingExp(false))
  }, [user])

  // Load saved items
  useEffect(() => {
    if (!user) return
    setLoadingSaved(true)
    getDocs(query(collection(db, "saves"), where("userId", "==", user.uid)))
      .then((snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as SavedItem))
        docs.sort((a, b) => (b.savedAt?.seconds ?? 0) - (a.savedAt?.seconds ?? 0))
        setSavedItems(docs)
      })
      .catch(() => {/* silent */})
      .finally(() => setLoadingSaved(false))
  }, [user])

  // Load updates
  useEffect(() => {
    if (!user) return
    setLoadingUpdates(true)
    getDocs(query(collection(db, "updates"), where("authorId", "==", user.uid)))
      .then((snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as UpdatePost))
        docs.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
        setMyUpdates(docs)
      })
      .catch(() => {/* silent */})
      .finally(() => setLoadingUpdates(false))
  }, [user])

  const handleSaveName = async () => {
    if (!nameInput.trim()) return
    setSavingName(true)
    try { await updateDisplayName(nameInput.trim()); setEditingName(false) }
    finally { setSavingName(false) }
  }

  const handleSaveContact = async () => {
    setSavingContact(true)
    try {
      await updateContactInfo({ phone, username, bio, instagram, linkedin, facebook, publicEmail })
    } finally {
      setSavingContact(false)
    }
  }

  const handleSwitchType = async (type: UserType) => {
    if (type === user?.userType) return
    setSwitchingType(true)
    try {
      await updateUserType(type)
      router.push(type === "college_student" ? "/dashboard/college" : type === "student" ? "/dashboard/student" : "/dashboard/professional")
    } finally { setSwitchingType(false) }
  }

  const handleDeleteAccount = async () => {
    if (confirmText !== "DELETE") return
    setDeleting(true)
    try {
      await deleteAccount(isEmailPasswordUser ? (deletePassword || undefined) : undefined)
      router.replace("/")
    } catch { /* toast shown by auth-context */ }
    finally { setDeleting(false); setDeleteOpen(false) }
  }

  const handleAdviceUpload = async () => {
    if (!adviceTitle.trim() || !adviceContent.trim() || !adviceCategory) {
      toast({ title: "Missing fields", description: "Please fill all advice fields.", variant: "destructive" })
      return
    }
    if (!user) return
    setUploadingAdvice(true)
    try {
      const newDoc = await addDoc(collection(db, "advice"), {
        title: adviceTitle.trim(), content: adviceContent.trim(), category: adviceCategory,
        targetAudience: adviceTarget, authorId: user.uid,
        authorName: user.displayName || user.email?.split("@")[0] || "Anonymous",
        authorType: user.userType, createdAt: serverTimestamp(), status: "published",
      })
      toast({ title: "Advice posted!", description: "Your advice is now visible to students." })
      const newPost: AdvicePost = {
        id: newDoc.id, title: adviceTitle.trim(), content: adviceContent.trim(),
        category: adviceCategory, targetAudience: adviceTarget,
        authorName: user.displayName || user.email?.split("@")[0] || "Anonymous",
        authorType: user.userType || "", createdAt: null, status: "published",
      }
      setMyAdvice((prev) => [newPost, ...prev])
      setAdviceTitle(""); setAdviceContent(""); setAdviceCategory(""); setAdviceTarget("student")
      setShowAdviceForm(false)
    } catch { toast({ title: "Error", description: "Could not post advice. Try again.", variant: "destructive" }) }
    finally { setUploadingAdvice(false) }
  }

  const handleArchiveAdvice = async (postId: string, currentStatus: string) => {
    const newStatus = currentStatus === "archived" ? "published" : "archived"
    try {
      await updateDoc(doc(db, "advice", postId), { status: newStatus })
      setMyAdvice((prev) => prev.map((p) => p.id === postId ? { ...p, status: newStatus } : p))
      toast({ title: newStatus === "archived" ? "Post archived" : "Post restored", description: newStatus === "archived" ? "This advice is now private." : "This advice is now public." })
    } catch { toast({ title: "Error", description: "Could not update post.", variant: "destructive" }) }
  }

  const handleDeleteAdvice = async (postId: string) => {
    try {
      await deleteDoc(doc(db, "advice", postId))
      setMyAdvice((prev) => prev.filter((p) => p.id !== postId))
      toast({ title: "Post deleted" })
    } catch { toast({ title: "Error", description: "Could not delete post.", variant: "destructive" }) }
  }

  const handleEditAdvice = (post: AdvicePost) => {
    setEditingPost(post)
    setEditTitle(post.title)
    setEditContent(post.content)
    setEditCategory(post.category)
    setEditTarget(post.targetAudience)
  }

  const handleSaveEdit = async () => {
    if (!editingPost || !editTitle.trim() || !editContent.trim() || !editCategory) return
    setSavingEdit(true)
    try {
      await updateDoc(doc(db, "advice", editingPost.id), {
        title: editTitle.trim(), content: editContent.trim(),
        category: editCategory, targetAudience: editTarget,
      })
      setMyAdvice((prev) => prev.map((p) => p.id === editingPost.id
        ? { ...p, title: editTitle.trim(), content: editContent.trim(), category: editCategory, targetAudience: editTarget }
        : p))
      toast({ title: "Advice updated!" })
      setEditingPost(null)
    } catch { toast({ title: "Error", description: "Could not update advice.", variant: "destructive" }) }
    finally { setSavingEdit(false) }
  }

  const handleUnsave = async (saveId: string) => {
    try {
      await deleteDoc(doc(db, "saves", saveId))
      setSavedItems((prev) => prev.filter((s) => s.id !== saveId))
    } catch { /* silent */ }
  }

  const handlePostUpdate = async () => {
    if (!user || !updateTitle.trim() || !updateContent.trim()) {
      toast({ title: "Fill title and content", variant: "destructive" })
      return
    }
    setUploadingUpdate(true)
    try {
      await saveUpdateToFirestore({
        title: updateTitle.trim(),
        content: updateContent.trim(),
        category: updateCategory,
        authorId: user.uid,
        authorName: user.displayName || user.email?.split("@")[0] || "Anonymous",
      })
      toast({ title: "Update posted!" })
      setUpdateTitle(""); setUpdateContent(""); setUpdateCategory("general")
      setShowUpdateForm(false)
      const snap = await getDocs(query(collection(db, "updates"), where("authorId", "==", user.uid)))
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as UpdatePost))
      docs.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
      setMyUpdates(docs)
    } catch { toast({ title: "Error", description: "Could not post update.", variant: "destructive" }) }
    finally { setUploadingUpdate(false) }
  }

  if (!user) return null
  const initials = getInitials(user.displayName, user.email)
  const displayName = user.displayName || user.email?.split("@")[0] || "User"

  return (
    <div className="container max-w-3xl py-4 md:py-10 space-y-4 md:space-y-6">

      {/* ── Profile Header Card ── */}
      <Card>
        <CardContent className="pt-5 pb-5">
          <div className="relative flex flex-col items-center text-center gap-2">

            {/* Settings icon — top-right corner */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="absolute top-0 right-0 h-8 w-8 shrink-0">
                  <Settings className="h-4 w-4" />
                </Button>
              </SheetTrigger>
                  <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                    <SheetHeader className="mb-6">
                      <SheetTitle className="flex items-center gap-2"><Settings className="h-5 w-5" /> Settings</SheetTitle>
                    </SheetHeader>
                    <div className="space-y-8 pr-1">

                      {/* Edit Name */}
                      <div>
                        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><User className="h-4 w-4" /> Display Name</h3>
                        <div className="flex gap-2">
                          <Input value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder="Your name"
                            onKeyDown={(e) => { if (e.key === "Enter") handleSaveName() }} />
                          <Button onClick={handleSaveName} disabled={savingName || !nameInput.trim()} size="sm">{savingName ? "Saving…" : "Save"}</Button>
                        </div>
                      </div>

                      <Separator />

                      {/* Contact & Social Info */}
                      <div>
                        <h3 className="font-semibold text-sm mb-1 flex items-center gap-2"><Phone className="h-4 w-4" /> Contact &amp; Social Info</h3>
                        <p className="text-xs text-muted-foreground mb-3">This info is public and shown on your profile so students can reach you.</p>
                        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-2.5 mb-4 text-xs text-amber-800 dark:text-amber-300">
                          ⚠️ Only add your number if you are comfortable being contacted by students.
                        </div>
                        {!contactLoaded ? (
                          <div className="flex items-center justify-center py-4"><div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
                        ) : (
                          <div className="space-y-3">
                            <div className="space-y-1.5">
                              <Label htmlFor="s-username" className="flex items-center gap-1.5 text-xs"><AtSign className="h-3 w-3" /> Username</Label>
                              <Input id="s-username" placeholder="yourhandle" value={username} onChange={(e) => setUsername(e.target.value.replace(/\s/g, "").toLowerCase())} />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="s-phone" className="flex items-center gap-1.5 text-xs"><Phone className="h-3 w-3" /> Phone / WhatsApp</Label>
                              <Input id="s-phone" placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="s-bio" className="text-xs">Bio</Label>
                              <Textarea id="s-bio" placeholder="Tell others about yourself…" rows={2} value={bio} onChange={(e) => setBio(e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="s-instagram" className="flex items-center gap-1.5 text-xs"><Instagram className="h-3 w-3" /> Instagram</Label>
                              <Input id="s-instagram" placeholder="username or URL" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="s-linkedin" className="flex items-center gap-1.5 text-xs"><Linkedin className="h-3 w-3" /> LinkedIn</Label>
                              <Input id="s-linkedin" placeholder="profile URL or username" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="s-facebook" className="flex items-center gap-1.5 text-xs"><Facebook className="h-3 w-3" /> Facebook</Label>
                              <Input id="s-facebook" placeholder="username or URL" value={facebook} onChange={(e) => setFacebook(e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="s-email" className="flex items-center gap-1.5 text-xs"><Mail className="h-3 w-3" /> Public Email</Label>
                              <Input id="s-email" type="email" placeholder="contact@example.com" value={publicEmail} onChange={(e) => setPublicEmail(e.target.value)} />
                            </div>
                            <Button onClick={handleSaveContact} disabled={savingContact} className="w-full gap-2">
                              <Save className="h-4 w-4" />{savingContact ? "Saving…" : "Save Contact Info"}
                            </Button>
                          </div>
                        )}
                      </div>

                      <Separator />

                      {/* Switch Profile Type */}
                      <div>
                        <h3 className="font-semibold text-sm mb-1 flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Switch Profile Type</h3>
                        <p className="text-xs text-muted-foreground mb-3">Your data is always preserved when you switch.</p>
                        <div className="space-y-2">
                          {(["college_student", "student", "professional"] as UserType[]).map((type) => {
                            const isCurrent = user.userType === type
                            return (
                              <div key={type} className={`flex items-center justify-between rounded-lg border p-3 ${isCurrent ? "border-primary bg-primary/5" : ""}`}>
                                <div className="flex items-center gap-2">
                                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isCurrent ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                                    {USER_TYPE_ICONS[type]}
                                  </div>
                                  <div><p className="font-medium text-xs">{USER_TYPE_LABELS[type]}</p><p className="text-xs text-muted-foreground">{USER_TYPE_DESCRIPTIONS[type]}</p></div>
                                </div>
                                {isCurrent ? <Badge variant="default" className="text-xs shrink-0">Current</Badge>
                                  : <Button size="sm" variant="outline" className="text-xs h-7 shrink-0" onClick={() => handleSwitchType(type)} disabled={switchingType}>{switchingType ? "…" : "Switch"}</Button>}
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      <Separator />

                      {/* Danger Zone */}
                      <div>
                        <h3 className="font-semibold text-sm mb-1 flex items-center gap-2 text-destructive"><Trash2 className="h-4 w-4" /> Danger Zone</h3>
                        <p className="text-xs text-muted-foreground mb-3">Permanently delete your account and all data. This cannot be undone.</p>
                        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" className="w-full"><Trash2 className="h-4 w-4 mr-2" /> Delete My Account</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                              <AlertDialogDescription asChild>
                                <div className="space-y-4">
                                  <p>This will permanently delete your account, profile, and all data. This cannot be undone.</p>
                                  {isGoogleUser && <div className="rounded-md bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-3 text-sm text-blue-700 dark:text-blue-300">You signed in with Google. Clicking delete will open a Google sign-in popup to re-verify your identity.</div>}
                                  {isEmailPasswordUser && <div className="space-y-1.5"><Label htmlFor="del-password">Confirm your password</Label><Input id="del-password" type="password" placeholder="Enter your password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} /></div>}
                                  <div className="space-y-1.5"><Label htmlFor="del-confirm">Type <strong>DELETE</strong> to confirm</Label><Input id="del-confirm" placeholder="DELETE" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} /></div>
                                </div>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => { setDeletePassword(""); setConfirmText("") }}>Cancel</AlertDialogCancel>
                              <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDeleteAccount} disabled={deleting || confirmText !== "DELETE" || (isEmailPasswordUser && !deletePassword)}>
                                {deleting ? "Deleting…" : "Yes, delete account"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>

                    </div>
                  </SheetContent>
                </Sheet>

            {/* Avatar — centered on top */}
            <Avatar className="h-20 w-20 border-2 border-primary/20">
              <AvatarImage src={user.photoURL ?? undefined} alt={displayName} referrerPolicy="no-referrer" />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Name + edit inline */}
            {editingName ? (
              <div className="flex items-center gap-2">
                <Input value={nameInput} onChange={(e) => setNameInput(e.target.value)} className="h-8 w-40 text-center" autoFocus
                  onKeyDown={(e) => { if (e.key === "Enter") handleSaveName(); if (e.key === "Escape") setEditingName(false) }} />
                <Button size="sm" onClick={handleSaveName} disabled={savingName}>{savingName ? "…" : "Save"}</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingName(false)}>✕</Button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-bold">{displayName}</h1>
                <button onClick={() => { setNameInput(user.displayName || ""); setEditingName(true) }} className="text-muted-foreground hover:text-foreground transition-colors">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {username && <p className="text-xs text-muted-foreground -mt-1">@{username}</p>}

            {user.userType && (
              <div className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap ${TYPE_PILL[user.userType] || ""}`}>
                <span className="[&>svg]:h-3.5 [&>svg]:w-3.5">{USER_TYPE_ICONS[user.userType]}</span>{USER_TYPE_LABELS[user.userType]}
              </div>
            )}

            <div className="flex items-center gap-1 text-xs text-muted-foreground flex-wrap justify-center">
              <Mail className="h-3 w-3 shrink-0" /><span className="truncate max-w-[200px]">{user.email}</span>
              {user.emailVerified
                ? <span className="text-green-600 flex items-center gap-0.5 ml-1"><CheckCircle2 className="h-3 w-3" /> Verified</span>
                : <span className="text-yellow-600 flex items-center gap-0.5 ml-1"><AlertCircle className="h-3 w-3" /> Unverified</span>}
            </div>

            {/* Bio */}
            {bio && <p className="text-xs text-muted-foreground leading-relaxed px-2 -mt-0.5">{bio}</p>}

            {/* Stats */}
            <div className="flex items-center gap-4 flex-wrap justify-center pt-1">
              <span className="text-xs"><span className="font-bold">{followerCount || 0}</span> <span className="text-muted-foreground">followers</span></span>
              <span className="text-xs"><span className="font-bold">{followingCount || 0}</span> <span className="text-muted-foreground">following</span></span>
              <span className="text-xs"><span className="font-bold">{myAdvice.length || 0}</span> <span className="text-muted-foreground">advice</span></span>
              <span className="text-xs"><span className="font-bold">{myExperiences.length || 0}</span> <span className="text-muted-foreground">experiences</span></span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Social Links ── */}
      {(phone || instagram || linkedin || facebook || publicEmail) && (
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-wrap gap-3">
              {phone && (
                <a href={`https://wa.me/${phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted transition-colors">
                  <Phone className="h-4 w-4 text-green-600" />{phone}
                </a>
              )}
              {instagram && (
                <a href={makeSocialUrl(instagram, "instagram")} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted transition-colors">
                  <Instagram className="h-4 w-4 text-pink-600" />{instagram.startsWith("http") ? "Instagram" : `@${instagram.replace(/^@/, "")}`}
                </a>
              )}
              {linkedin && (
                <a href={makeSocialUrl(linkedin, "linkedin")} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted transition-colors">
                  <Linkedin className="h-4 w-4 text-blue-700" />{linkedin.startsWith("http") ? "LinkedIn" : linkedin}
                </a>
              )}
              {facebook && (
                <a href={makeSocialUrl(facebook, "facebook")} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted transition-colors">
                  <Facebook className="h-4 w-4 text-blue-600" />{facebook.startsWith("http") ? "Facebook" : facebook}
                </a>
              )}
              {publicEmail && (
                <a href={`mailto:${publicEmail}`}
                  className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted transition-colors">
                  <Mail className="h-4 w-4 text-red-500" />{publicEmail}
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Action Buttons ── */}
      <div className="flex flex-wrap gap-3">
        {canUploadAdvice && (
          <Button onClick={() => setShowAdviceForm(true)} className="gap-2">
            <Lightbulb className="h-4 w-4" /> Share Advice
          </Button>
        )}
        <Button asChild variant="outline" className="gap-2">
          <Link href="/submit"><Upload className="h-4 w-4" /> Submit Experience</Link>
        </Button>
        <Button asChild variant="outline" className="gap-2">
          <Link href="/messages"><MessageCircle className="h-4 w-4" /> Messages</Link>
        </Button>
        <Button asChild variant="ghost" size="sm" className="gap-1.5 text-muted-foreground ml-auto">
          <Link href={`/community/${user.uid}`}><ExternalLink className="h-3.5 w-3.5" /> View Public Profile</Link>
        </Button>
      </div>

      {/* ── Updates (exam, education tech, etc.) ── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base flex items-center gap-2"><Megaphone className="h-4 w-4 text-primary" /> Updates</CardTitle>
            <Button size="sm" variant="outline" className="gap-1.5 w-fit" onClick={() => setShowUpdateForm(true)}>
              <Plus className="h-4 w-4" /> Post update
            </Button>
          </div>
          <CardDescription>Share exam updates, education tech news, or any useful update.</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingUpdates && <div className="flex justify-center py-6"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}
          {!loadingUpdates && myUpdates.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No updates yet. Post one to help the community.</p>}
          {!loadingUpdates && myUpdates.length > 0 && (
            <div className="space-y-3">
              {myUpdates.map((up) => (
                <div key={up.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-medium text-sm">{up.title}</h3>
                    <Badge variant="outline" className="text-xs capitalize shrink-0">{up.category.replace("_", " ")}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-2">{up.content}</p>
                  {up.createdAt?.toDate && <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><Calendar className="h-3 w-3" />{up.createdAt.toDate().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Post Update Dialog */}
      <Dialog open={showUpdateForm} onOpenChange={setShowUpdateForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5" /> Post an update</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={updateCategory} onValueChange={(v) => setUpdateCategory(v as typeof updateCategory)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="exam_update">Exam update</SelectItem>
                  <SelectItem value="education_tech">Education / Tech</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input placeholder="e.g. JEE Main 2025 date announced" value={updateTitle} onChange={(e) => setUpdateTitle(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Content *</Label>
              <Textarea placeholder="Share the update details…" rows={4} value={updateContent} onChange={(e) => setUpdateContent(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowUpdateForm(false)} className="flex-1">Cancel</Button>
              <Button onClick={handlePostUpdate} disabled={uploadingUpdate || !updateTitle.trim() || !updateContent.trim()} className="flex-1">{uploadingUpdate ? "Posting…" : "Post update"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Advice Upload Dialog ── */}
      <Dialog open={showAdviceForm} onOpenChange={setShowAdviceForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Lightbulb className="h-5 w-5 text-primary" /> Share Advice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="advice-title">Title *</Label>
              <Input id="advice-title" placeholder="e.g. How I cracked my first placement interview" value={adviceTitle} onChange={(e) => setAdviceTitle(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="advice-category">Category *</Label>
                <Select value={adviceCategory} onValueChange={setAdviceCategory}>
                  <SelectTrigger id="advice-category"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>{ADVICE_CATEGORIES.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="advice-target">For *</Label>
                <Select value={adviceTarget} onValueChange={setAdviceTarget}>
                  <SelectTrigger id="advice-target"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Exam Prep Students</SelectItem>
                    <SelectItem value="college_student">College Students</SelectItem>
                    <SelectItem value="all">All Students</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="advice-content">Your Advice *</Label>
              <Textarea id="advice-content" placeholder="Share your experience, tips, lessons learned, and guidance in detail…" rows={7} value={adviceContent} onChange={(e) => setAdviceContent(e.target.value)} />
              <p className="text-xs text-muted-foreground">{adviceContent.length} characters</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowAdviceForm(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleAdviceUpload} disabled={uploadingAdvice || !adviceTitle.trim() || !adviceContent.trim() || !adviceCategory} className="flex-1">
                {uploadingAdvice ? "Publishing…" : "Publish Advice"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── My content: side toggle All | Archived | Saved ── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">My content</CardTitle>
            <div className="flex rounded-lg border p-0.5 bg-muted/50 w-fit">
              <button
                onClick={() => setProfileViewMode("all")}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5 ${profileViewMode === "all" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Lightbulb className="h-3.5 w-3.5" /> All
              </button>
              <button
                onClick={() => setProfileViewMode("archived")}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5 ${profileViewMode === "archived" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Archive className="h-3.5 w-3.5" /> Archived
              </button>
              <button
                onClick={() => setProfileViewMode("saved")}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5 ${profileViewMode === "saved" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Bookmark className="h-3.5 w-3.5" /> Saved
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
        {profileViewMode === "all" && (
        <>
        {/* Advice (published) */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2"><Lightbulb className="h-4 w-4" /> Advice</h3>
          {loadingAdvice && (
            <div className="flex justify-center py-10"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
          )}
          {!loadingAdvice && myAdvice.filter(p => p.status !== "archived").length === 0 && (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <Lightbulb className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="font-medium text-sm">No advice posted yet</p>
              <p className="text-xs text-muted-foreground mt-1 mb-4">Share your knowledge to help students succeed.</p>
              <Button onClick={() => setShowAdviceForm(true)} size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" /> Share Your First Advice
              </Button>
            </div>
          )}
          {!loadingAdvice && myAdvice.filter(p => p.status !== "archived").length > 0 && (
            <div className="space-y-3">
              {myAdvice.filter(p => p.status !== "archived").map((post) => (
                <div key={post.id} className="rounded-lg border p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <button className="flex-1 text-left" onClick={() => setSelectedAdvice(post)}>
                      <h3 className="font-medium text-sm hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
                    </button>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="h-3.5 w-3.5" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditAdvice(post)}><Pencil className="h-3.5 w-3.5 mr-2" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleArchiveAdvice(post.id, post.status)}><Archive className="h-3.5 w-3.5 mr-2" /> Archive (make private)</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDeleteAdvice(post.id)}><Trash2 className="h-3.5 w-3.5 mr-2" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{post.content}</p>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">For: {post.targetAudience === "all" ? "All" : post.targetAudience === "college_student" ? "College" : "Exam Prep"}</Badge>
                    {post.createdAt?.toDate && <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />{post.createdAt.toDate().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Experiences in All view */}
        <div>
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2"><Building className="h-4 w-4" /> Experiences</h3>
          {loadingExp && <div className="flex justify-center py-6"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}
          {!loadingExp && myExperiences.length === 0 && (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              <Building className="h-8 w-8 mx-auto mb-2 opacity-30" /> No experiences yet. <Link href="/submit" className="text-primary hover:underline">Submit one</Link>.
            </div>
          )}
          {!loadingExp && myExperiences.length > 0 && (
            <div className="space-y-3">
              {myExperiences.map((exp) => (
                <Link key={exp.id} href={`/experiences/${String(exp.id)}`} className="block rounded-lg border p-4 hover:bg-muted/50 hover:border-primary/30 transition-all group">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-medium text-sm group-hover:text-primary transition-colors">{exp.company}</h3>
                      {exp.role && <p className="text-xs text-muted-foreground">{exp.role}</p>}
                    </div>
                    <div className="flex gap-1.5 flex-wrap justify-end">
                      <Badge variant="outline" className="text-xs">{exp.type}</Badge>
                      <Badge variant="secondary" className="text-xs">{String(exp.year || "")}</Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{exp.excerpt}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {exp.branch && <span className="flex items-center gap-1"><GraduationCap className="h-3 w-3" />{exp.branch}</span>}
                    {exp.package && <span className="flex items-center gap-1"><Award className="h-3 w-3" />{exp.package}</span>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        </>
        )}

        {profileViewMode === "archived" && (
          myAdvice.filter(p => p.status === "archived").length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              <Archive className="h-8 w-8 mx-auto mb-2 opacity-30" />
              No archived posts. Archived advice is private and only visible to you.
            </div>
          ) : (
            <div className="space-y-3">
              {myAdvice.filter(p => p.status === "archived").map((post) => (
                <div key={post.id} className="rounded-lg border border-dashed p-4 opacity-70">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-medium text-sm line-clamp-1">{post.title}</h3>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge variant="outline" className="text-xs text-muted-foreground">Private</Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="h-3.5 w-3.5" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleArchiveAdvice(post.id, post.status)}><ArchiveRestore className="h-3.5 w-3.5 mr-2" /> Unarchive (make public)</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDeleteAdvice(post.id)}><Trash2 className="h-3.5 w-3.5 mr-2" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{post.content}</p>
                </div>
              ))}
            </div>
          )
        )}

        {profileViewMode === "saved" && (
          loadingSaved ? (
            <div className="flex justify-center py-10"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
          ) : savedItems.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <Bookmark className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="font-medium text-sm">Nothing saved yet</p>
              <p className="text-xs text-muted-foreground mt-1">Bookmark advice and experiences to find them easily here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedItems.map((item) => (
                <div key={item.id} className="rounded-lg border p-4 flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs capitalize shrink-0">{item.itemType === "advice" ? "Advice" : "Experience"}</Badge>
                      {item.itemType === "advice" ? (
                        <span className="font-medium text-sm line-clamp-1">{item.title}</span>
                      ) : (
                        <Link href={`/experiences/${item.itemId}`} className="font-medium text-sm hover:text-primary transition-colors line-clamp-1">{item.title}</Link>
                      )}
                    </div>
                    {item.meta && <p className="text-xs text-muted-foreground line-clamp-1">{item.meta}</p>}
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => handleUnsave(item.id)}>
                    <BookmarkCheck className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )
        )}
        </CardContent>
      </Card>

      {/* ── My Shared Resources ── */}
      {(mySharedResources.length > 0 || loadingSharedResources) && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Upload className="h-4 w-4 text-primary" /> My Shared Resources
              </CardTitle>
              <Button asChild variant="outline" size="sm" className="text-xs">
                <Link href="/resources">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingSharedResources ? (
              <div className="flex justify-center py-6">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : (
              <div className="space-y-2">
                {mySharedResources.map((r) => (
                  <div key={r.id} className="flex items-start gap-3 rounded-lg border p-3">
                    <div className="mt-0.5 shrink-0">
                      {r.fileType === "image" ? <ImageIcon className="h-4 w-4 text-blue-500" /> :
                        r.fileType === "pdf" ? <FileText className="h-4 w-4 text-red-500" /> :
                        r.type === "link" ? <Link2 className="h-4 w-4 text-blue-400" /> :
                        <File className="h-4 w-4 text-orange-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{r.title}</p>
                      {r.description && <p className="text-xs text-muted-foreground line-clamp-1">{r.description}</p>}
                      {r.fileType === "image" && r.fileUrl && (
                        <a href={r.fileUrl} target="_blank" rel="noopener noreferrer">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={r.fileUrl} alt={r.title} className="mt-2 rounded-lg max-h-32 object-cover border" />
                        </a>
                      )}
                    </div>
                    <div className="shrink-0">
                      {r.url && (
                        <a href={r.url} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="icon" className="h-7 w-7"><ExternalLink className="h-3.5 w-3.5" /></Button>
                        </a>
                      )}
                      {r.fileUrl && r.fileType !== "image" && (
                        <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" download={r.fileName}>
                          <Button variant="ghost" size="icon" className="h-7 w-7"><ArrowRight className="h-3.5 w-3.5" /></Button>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Advice Dialog */}
      <Dialog open={!!editingPost} onOpenChange={(o) => !o && setEditingPost(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Pencil className="h-5 w-5" /> Edit Advice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Advice title…" />
            </div>
            <div className="space-y-1.5">
              <Label>Content</Label>
              <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} placeholder="Your advice…" rows={8} className="resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={editCategory} onValueChange={setEditCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Interview Preparation","Resume Tips","Career Guidance","Internship Tips","Placement Strategy","Study Strategy","Networking","Technical Skills","Soft Skills","General Advice"].map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Target Audience</Label>
                <Select value={editTarget} onValueChange={setEditTarget}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students</SelectItem>
                    <SelectItem value="college_student">College Students</SelectItem>
                    <SelectItem value="student">Exam Prep Students</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setEditingPost(null)}>Cancel</Button>
              <Button onClick={handleSaveEdit} disabled={savingEdit || !editTitle.trim() || !editContent.trim()}>
                {savingEdit ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Advice full-view dialog */}
      <Dialog open={!!selectedAdvice} onOpenChange={(o) => !o && setSelectedAdvice(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedAdvice && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl leading-snug pr-6">{selectedAdvice.title}</DialogTitle>
                <div className="flex gap-2 pt-1"><Badge variant="secondary">{selectedAdvice.category}</Badge></div>
              </DialogHeader>
              <div className="flex items-center gap-3 py-3 border-y">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">{initials}</div>
                <div>
                  <p className="text-sm font-medium">{displayName}</p>
                  <p className="text-xs text-muted-foreground">{user.userType ? USER_TYPE_LABELS[user.userType] : ""}</p>
                </div>
              </div>
              <div className="text-sm leading-relaxed whitespace-pre-wrap">{selectedAdvice.content}</div>
            </>
          )}
        </DialogContent>
      </Dialog>

    </div>
  )
}

export default function ProfilePage() {
  return <RequireLogin><ProfileContent /></RequireLogin>
}
