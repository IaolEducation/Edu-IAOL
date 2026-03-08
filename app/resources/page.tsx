"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  BookOpen, Video, FileText, ArrowLeft, ExternalLink, Youtube,
  BookMarked, Globe, Upload, Link2, Image as ImageIcon, File,
  Download, X, Plus, Loader2,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { db } from "@/lib/firebase"
import { uploadFile } from "@/lib/upload"
import {
  collection, addDoc, getDocs, orderBy, query, serverTimestamp, Timestamp,
} from "firebase/firestore"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"

interface SharedResource {
  id: string
  title: string
  description?: string
  url?: string
  fileUrl?: string
  fileType?: "image" | "pdf" | "doc" | "other"
  fileName?: string
  type: "link" | "file"
  authorId: string
  authorName: string
  authorPhoto?: string
  category: string
  createdAt: Timestamp | null
}

const CATEGORIES = ["DSA", "System Design", "Resume", "Interview Prep", "Notes", "Video", "Other"]

function formatTime(ts: Timestamp | null) {
  if (!ts) return ""
  const d = ts.toDate()
  return d.toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })
}

function getInitials(name: string) {
  return name.trim().split(" ").filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join("") || "?"
}

function fileIcon(fileType?: string) {
  if (fileType === "image") return <ImageIcon className="h-4 w-4 text-blue-500" />
  if (fileType === "pdf") return <FileText className="h-4 w-4 text-red-500" />
  return <File className="h-4 w-4 text-orange-500" />
}

function ResourcesContent() {
  const { user } = useAuth()
  const [sharedResources, setSharedResources] = useState<SharedResource[]>([])
  const [loadingResources, setLoadingResources] = useState(true)
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [shareType, setShareType] = useState<"link" | "file">("link")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [url, setUrl] = useState("")
  const [category, setCategory] = useState("Other")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const q = query(collection(db, "shared_resources"), orderBy("createdAt", "desc"))
    getDocs(q).then((snap) => {
      setSharedResources(snap.docs.map((d) => ({ id: d.id, ...d.data() } as SharedResource)))
    }).catch(() => {}).finally(() => setLoadingResources(false))
  }, [])

  const handleSubmit = async () => {
    if (!user || !title.trim()) return
    if (shareType === "link" && !url.trim()) return
    if (shareType === "file" && !selectedFile) return

    setUploading(true)
    try {
      const base: Omit<SharedResource, "id" | "fileUrl" | "fileType" | "fileName" | "url"> = {
        title: title.trim(),
        description: description.trim() || undefined,
        type: shareType,
        authorId: user.uid,
        authorName: user.displayName || user.email?.split("@")[0] || "User",
        authorPhoto: user.photoURL || undefined,
        category,
        createdAt: null,
      }

      if (shareType === "link") {
        await addDoc(collection(db, "shared_resources"), {
          ...base,
          url: url.trim(),
          createdAt: serverTimestamp(),
        })
        const newDoc: SharedResource = { id: Date.now().toString(), ...base, url: url.trim(), createdAt: null }
        setSharedResources((p) => [newDoc, ...p])
      } else if (selectedFile) {
        const ext = selectedFile.name.split(".").pop()?.toLowerCase() || ""
        let fileType: "image" | "pdf" | "doc" | "other" = "other"
        if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) fileType = "image"
        else if (ext === "pdf") fileType = "pdf"
        else if (["doc", "docx", "txt", "ppt", "pptx", "xls", "xlsx"].includes(ext)) fileType = "doc"

        const pathPrefix = `resources/${user.uid}`
        const fileUrl = await uploadFile(selectedFile, pathPrefix)
        await addDoc(collection(db, "shared_resources"), {
          ...base,
          fileUrl,
          fileType,
          fileName: selectedFile.name,
          createdAt: serverTimestamp(),
        })
        const newDoc: SharedResource = {
          id: Date.now().toString(), ...base,
          fileUrl, fileType, fileName: selectedFile.name, createdAt: null,
        }
        setSharedResources((p) => [newDoc, ...p])
      }

      // Reset
      setTitle("")
      setDescription("")
      setUrl("")
      setSelectedFile(null)
      setCategory("Other")
      setShowForm(false)
      toast({ title: "Resource shared!", description: "Your resource is now visible to the community." })
    } catch (e: any) {
      console.error("Upload error:", e)
      const msg = e?.code === "storage/unauthorized"
        ? "Storage permission denied. Please contact the admin."
        : e?.message || "Upload failed. Please try again."
      toast({ title: "Upload failed", description: msg, variant: "destructive" })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="container px-3 md:px-6 py-6 md:py-12">
      <Button asChild variant="ghost" className="mb-5">
        <Link href="/" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
      </Button>

      <div className="flex flex-col gap-6 md:gap-8">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight">Placement Resources</h1>
          <p className="text-sm text-muted-foreground">
            Access curated resources to help you prepare for placements and ace your interviews
          </p>
        </div>

        {/* ── Static Resources ── */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-3 pt-4 px-4">
              <CardTitle className="text-sm md:text-base flex items-center gap-2">
                <BookMarked className="h-4 w-4 text-primary" /> Study Notes & Materials
              </CardTitle>
              <CardDescription className="text-xs">Access comprehensive study materials</CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <ExternalLink className="h-3 w-3 shrink-0" />
                  <a href="https://drive.google.com/drive/folders/16WwCey8Ai8eZIox_YRGCLfs5L75tghfx" target="_blank" rel="noopener noreferrer" className="hover:underline">Company wise Questions</a>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 pt-4 px-4">
              <CardTitle className="text-sm md:text-base flex items-center gap-2">
                <Video className="h-4 w-4 text-primary" /> Video Resources
              </CardTitle>
              <CardDescription className="text-xs">Best YouTube channels for placement prep</CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                {[
                  ["https://www.youtube.com/c/takeUforward", "Take U Forward (Striver)"],
                  ["https://www.youtube.com/c/GateSmashers", "Gate Smashers"],
                  ["https://www.youtube.com/c/NeetCode", "NeetCode"],
                  ["https://www.youtube.com/c/CodingNinjas", "Coding Ninjas"],
                  ["https://www.youtube.com/c/SystemDesignInterview", "System Design Interview"],
                ].map(([href, label]) => (
                  <li key={href} className="flex items-center gap-2">
                    <Youtube className="h-3 w-3 text-red-500 shrink-0" />
                    <a href={href} target="_blank" rel="noopener noreferrer" className="hover:underline">{label}</a>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Coding Platforms */}
        <Card>
          <CardHeader className="pb-3 pt-4 px-4">
            <CardTitle className="text-sm md:text-base flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" /> Coding Platforms
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
              {[
                ["https://leetcode.com/", "LeetCode", "Comprehensive DSA"],
                ["https://codeforces.com/", "Codeforces", "Competitive programming"],
                ["https://www.geeksforgeeks.org/", "GeeksforGeeks", "Comprehensive resources"],
                ["https://neetcode.io/", "NeetCode", "Curated problem lists"],
                ["https://www.hackerrank.com/", "HackerRank", "Interview preparation"],
                ["https://www.interviewbit.com/", "InterviewBit", "Company-specific prep"],
                ["https://www.codechef.com/", "CodeChef", "Competitive coding"],
                ["https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2", "TakeUforward", "Best free tutorials"],
              ].map(([href, name, desc]) => (
                <Button key={href} variant="outline" className="h-auto py-3 flex flex-col gap-1 text-left" asChild>
                  <a href={href} target="_blank" rel="noopener noreferrer">
                    <span className="font-bold text-xs">{name}</span>
                    <span className="text-[10px] text-muted-foreground">{desc}</span>
                  </a>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── Community Shared Resources ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg md:text-xl font-bold">Community Resources</h2>
            {user && (
              <Button size="sm" className="gap-1.5" onClick={() => setShowForm(!showForm)}>
                {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {showForm ? "Cancel" : "Share Resource"}
              </Button>
            )}
          </div>

          {/* Upload Form */}
          {showForm && user && (
            <Card className="mb-4">
              <CardContent className="pt-4 pb-4 px-4 space-y-3">
                <div className="text-sm font-semibold">Share a Resource</div>

                {/* Type toggle */}
                <div className="flex gap-2">
                  <Button
                    size="sm" variant={shareType === "link" ? "default" : "outline"}
                    onClick={() => setShareType("link")} className="gap-1.5 text-xs"
                  >
                    <Link2 className="h-3.5 w-3.5" /> Link
                  </Button>
                  <Button
                    size="sm" variant={shareType === "file" ? "default" : "outline"}
                    onClick={() => setShareType("file")} className="gap-1.5 text-xs"
                  >
                    <Upload className="h-3.5 w-3.5" /> Upload File
                  </Button>
                </div>

                <div className="space-y-2">
                  <Input
                    placeholder="Title *"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-sm"
                  />
                  <Textarea
                    placeholder="Description (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="text-sm resize-none"
                    rows={2}
                  />

                  {shareType === "link" ? (
                    <Input
                      placeholder="URL *"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="text-sm"
                    />
                  ) : (
                    <div>
                      <input
                        ref={fileRef}
                        type="file"
                        className="hidden"
                        accept="image/*,.pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      />
                      {selectedFile ? (
                        <div className="flex items-center gap-2 p-2 border rounded-lg text-sm">
                          {fileIcon()}
                          <span className="truncate flex-1 text-xs">{selectedFile.name}</span>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedFile(null)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button variant="outline" size="sm" className="w-full gap-2 text-xs" onClick={() => fileRef.current?.click()}>
                          <Upload className="h-3.5 w-3.5" /> Choose File (image, PDF, doc…)
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Category */}
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORIES.map((c) => (
                      <button
                        key={c}
                        onClick={() => setCategory(c)}
                        className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${category === c ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  size="sm" className="w-full gap-2"
                  onClick={handleSubmit}
                  disabled={uploading || !title.trim() || (shareType === "link" ? !url.trim() : !selectedFile)}
                >
                  {uploading ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading…</> : "Share Resource"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Resource list */}
          {loadingResources ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : sharedResources.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">
              No community resources yet. Be the first to share!
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {sharedResources.map((r) => (
                <Card key={r.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="pt-3 pb-3 px-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        {r.type === "link" ? (
                          <Link2 className="h-4 w-4 text-blue-500" />
                        ) : (
                          fileIcon(r.fileType)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-semibold text-sm leading-tight truncate">{r.title}</p>
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 mt-0.5">{r.category}</Badge>
                          </div>
                          {r.url && (
                            <a href={r.url} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Button>
                            </a>
                          )}
                          {r.fileUrl && (
                            <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" download={r.fileName}>
                              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                                {r.fileType === "image" ? (
                                  <ExternalLink className="h-3.5 w-3.5" />
                                ) : (
                                  <Download className="h-3.5 w-3.5" />
                                )}
                              </Button>
                            </a>
                          )}
                        </div>
                        {r.description && (
                          <p className="text-xs text-muted-foreground mt-1 leading-snug line-clamp-2">{r.description}</p>
                        )}
                        {/* Image preview */}
                        {r.fileType === "image" && r.fileUrl && (
                          <a href={r.fileUrl} target="_blank" rel="noopener noreferrer">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={r.fileUrl}
                              alt={r.title}
                              className="mt-2 rounded-lg max-h-36 w-full object-cover border"
                            />
                          </a>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={r.authorPhoto} referrerPolicy="no-referrer" />
                            <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
                              {getInitials(r.authorName)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-[11px] text-muted-foreground truncate">{r.authorName}</span>
                          {r.createdAt && (
                            <span className="text-[11px] text-muted-foreground ml-auto shrink-0">{formatTime(r.createdAt)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ResourcesPage() {
  return <ResourcesContent />
}
