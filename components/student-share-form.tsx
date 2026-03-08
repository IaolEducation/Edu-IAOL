"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { saveStudentShareToFirestore } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import { FileText, Link2, Plus, Trash2, CheckCircle2 } from "lucide-react"

const SHARE_TYPES = [
  { value: "notes", label: "Notes" },
  { value: "resource", label: "Resource" },
  { value: "reference", label: "Reference" },
  { value: "other", label: "Other" },
] as const

export default function StudentShareForm() {
  const { user } = useAuth()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [type, setType] = useState<"notes" | "resource" | "reference" | "other">("notes")
  const [links, setLinks] = useState<string[]>([""])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const addLink = () => setLinks((prev) => [...prev, ""])
  const removeLink = (i: number) => setLinks((prev) => prev.filter((_, idx) => idx !== i))
  const setLink = (i: number, v: string) => setLinks((prev) => prev.map((l, idx) => (idx === i ? v : l)))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (!title.trim()) {
      toast({ title: "Title required", variant: "destructive" })
      return
    }
    if (!content.trim() || content.trim().length < 20) {
      toast({ title: "Please add at least 20 characters of description", variant: "destructive" })
      return
    }
    setIsSubmitting(true)
    try {
      const linkList = links.filter((l) => l.trim())
      await saveStudentShareToFirestore({
        type,
        title: title.trim(),
        content: content.trim(),
        links: linkList.length ? linkList : undefined,
        authorId: user.uid,
        authorName: user.displayName || user.email?.split("@")[0] || "Anonymous",
        authorType: user.userType || "student",
      })
      toast({ title: "Shared successfully!", description: "Your notes/resource is now visible to others." })
      setIsSubmitted(true)
      setTitle("")
      setContent("")
      setLinks([""])
      setType("notes")
    } catch (err) {
      toast({
        title: "Failed to share",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <Card className="border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20">
        <CardContent className="pt-6 pb-6 text-center">
          <CheckCircle2 className="h-12 w-12 mx-auto text-green-600 dark:text-green-400 mb-4" />
          <h3 className="font-semibold text-lg mb-2">Thank you for sharing!</h3>
          <p className="text-sm text-muted-foreground mb-4">Your content is now visible to the community.</p>
          <Button variant="outline" onClick={() => setIsSubmitted(false)}>Share another</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <FileText className="h-5 w-5" /> Share notes, resources or references
        </CardTitle>
        <CardDescription>
          Share study notes, useful resources, book references, or anything that can help other students.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="share-type">Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
              <SelectTrigger id="share-type" className="w-full sm:max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SHARE_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="share-title">Title *</Label>
            <Input
              id="share-title"
              placeholder="e.g. Physics formulae, Chemistry notes, NEET tips"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="share-content">Description / Content * (min 20 characters)</Label>
            <Textarea
              id="share-content"
              placeholder="Describe your notes or resource. You can paste text, key points, or links."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              required
              className="w-full resize-y min-h-[120px]"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="flex items-center gap-1.5"><Link2 className="h-4 w-4" /> Links (optional)</Label>
              <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={addLink}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {links.map((link, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    type="url"
                    placeholder="https://..."
                    value={link}
                    onChange={(e) => setLink(i, e.target.value)}
                    className="flex-1"
                  />
                  {links.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={() => removeLink(i)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? "Sharing…" : "Share"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
