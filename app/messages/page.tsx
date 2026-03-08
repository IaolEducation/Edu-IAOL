"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { db } from "@/lib/firebase"
import { collection, query, where, onSnapshot, Timestamp, deleteDoc, doc } from "firebase/firestore"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MessageCircle, Search, ArrowLeft, Edit, MoreVertical, Trash2 } from "lucide-react"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import Link from "next/link"
import RequireLogin from "@/components/require-login"

interface Chat {
  id: string
  participants: string[]
  participantNames: Record<string, string>
  participantPhotos: Record<string, string>
  lastMessage: string
  lastMessageAt: Timestamp | null
  unreadCounts?: Record<string, number>
}

function getOtherUid(participants: string[], myUid: string) {
  return participants.find((p) => p !== myUid) || ""
}

function formatTime(ts: Timestamp | null) {
  if (!ts) return ""
  const d = ts.toDate()
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return "now"
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`
  if (diff < 604800000) return d.toLocaleDateString("en", { weekday: "short" })
  return d.toLocaleDateString("en", { month: "short", day: "numeric" })
}

function getInitials(name: string) {
  return name.trim().split(" ").filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join("") || "?"
}

function InboxContent() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [chats, setChats] = useState<Chat[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [deleteChatId, setDeleteChatId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (authLoading || !user?.uid) {
      if (!authLoading) setLoading(false)
      return
    }
    // Query without orderBy to avoid requiring a composite index; sort in memory instead.
    // This makes the query work reliably on refresh and avoids missing-index errors.
    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", user.uid),
    )
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Chat))
        list.sort((a, b) => {
          const at = a.lastMessageAt?.toMillis?.() ?? 0
          const bt = b.lastMessageAt?.toMillis?.() ?? 0
          return bt - at
        })
        setChats(list)
        setLoading(false)
      },
      (err) => {
        console.error("Inbox query error:", err)
        setLoading(false)
      },
    )
    return () => unsub()
  }, [user?.uid, authLoading])

  const filtered = chats.filter((c) => {
    if (!search.trim()) return true
    const otherUid = getOtherUid(c.participants, user?.uid || "")
    const name = c.participantNames?.[otherUid] || ""
    return name.toLowerCase().includes(search.toLowerCase())
  })

  const totalUnread = chats.reduce((sum, c) => sum + (c.unreadCounts?.[user?.uid || ""] || 0), 0)

  const handleDeleteChat = async () => {
    if (!deleteChatId) return
    setDeleting(true)
    try {
      await deleteDoc(doc(db, "chats", deleteChatId))
      setDeleteChatId(null)
    } catch (e) { console.error(e) }
    setDeleting(false)
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-3 border-b border-white/10 bg-background/95 backdrop-blur shrink-0">
        <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => router.push("/")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-base leading-tight flex items-center gap-1.5">
            Messages
            {totalUnread > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground px-1">
                {totalUnread > 99 ? "99+" : totalUnread}
              </span>
            )}
          </h1>
        </div>
        <Button asChild variant="ghost" size="icon" className="h-9 w-9 shrink-0">
          <Link href="/community" title="Find people to message">
            <Edit className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Advanced inbox card */}
      <div className="flex-1 flex flex-col min-h-0 p-4">
        <div className="relative flex flex-col border border-border rounded-xl bg-card overflow-hidden flex-1 min-h-0 shadow-sm">
          {/* Search with gradient border (Tailwind) */}
          <div className="p-3 border-b border-border shrink-0">
            <div className="relative rounded-xl p-[2px] bg-gradient-to-br from-primary/40 via-transparent to-violet-500/30 focus-within:from-primary/50 focus-within:to-violet-500/40 transition-all">
              <div className="relative rounded-lg overflow-hidden">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                <input
                  type="text"
                  placeholder="Search conversations…"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg bg-muted/40 border-0 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-inset placeholder:text-muted-foreground"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Chat list */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground px-6">
                <MessageCircle className="h-14 w-14 opacity-20" />
                <p className="text-sm font-medium">No conversations yet</p>
                <p className="text-xs">Visit someone&apos;s profile in Community to start a chat.</p>
                <Button asChild variant="outline" size="sm" className="mt-1">
                  <Link href="/community">Browse Community</Link>
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {filtered.map((chat) => {
                  const myUid = user?.uid || ""
                  const otherUid = getOtherUid(chat.participants, myUid)
                  const name = chat.participantNames?.[otherUid] || "User"
                  const photo = chat.participantPhotos?.[otherUid] || ""
                  const unread = chat.unreadCounts?.[myUid] || 0
                  const isUnread = unread > 0

                  return (
                    <div
                      key={chat.id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 active:bg-muted/50 transition-colors group"
                    >
                      <button
                        className="flex-1 flex items-center gap-3 min-w-0 text-left"
                        onClick={() => router.push(`/messages/${chat.id}`)}
                      >
                        <div className="relative shrink-0">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={photo} alt={name} referrerPolicy="no-referrer" />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                              {getInitials(name)}
                            </AvatarFallback>
                          </Avatar>
                          {isUnread && (
                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-primary border-2 border-background" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-sm truncate ${isUnread ? "font-bold" : "font-medium"}`}>{name}</span>
                            <span className="text-[11px] text-muted-foreground shrink-0">
                              {formatTime(chat.lastMessageAt)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2 mt-0.5">
                            <p className={`text-xs truncate ${isUnread ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                              {chat.lastMessage || "Start a conversation"}
                            </p>
                            {isUnread && (
                              <span className="shrink-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground px-1.5">
                                {unread > 9 ? "9+" : unread}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => router.push(`/messages/${chat.id}`)}>
                            Open chat
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/community/${otherUid}`}>View profile</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteChatId(chat.id) }}>
                            <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete conversation
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete conversation confirm */}
      <Dialog open={!!deleteChatId} onOpenChange={(open) => !open && setDeleteChatId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete conversation?</DialogTitle>
            <DialogDescription>This will remove the chat from your inbox. The other person will no longer see it. This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeleteChatId(null)}>Cancel</Button>
            <Button variant="destructive" size="sm" onClick={handleDeleteChat} disabled={deleting}>
              {deleting ? "…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <RequireLogin>
      <InboxContent />
    </RequireLogin>
  )
}
