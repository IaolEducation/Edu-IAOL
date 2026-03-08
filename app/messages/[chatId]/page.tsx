"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { db } from "@/lib/firebase"
import { uploadFile } from "@/lib/upload"
import {
  doc, collection, addDoc, onSnapshot, orderBy, query,
  setDoc, serverTimestamp, getDoc, updateDoc, deleteDoc, increment, Timestamp,
} from "firebase/firestore"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ArrowLeft, Send, Paperclip, FileText, Download, X,
  MoreVertical, Ban, Flag, ExternalLink, Image as ImageIcon, File,
  ShieldAlert, CheckCheck, Pencil, Trash2, Link2,
} from "lucide-react"
import RequireLogin from "@/components/require-login"
import Link from "next/link"

interface Message {
  id: string
  senderId: string
  text?: string
  fileUrl?: string
  fileType?: "image" | "pdf" | "doc" | "other"
  fileName?: string
  createdAt: Timestamp | null
}

interface ChatMeta {
  participants: string[]
  participantNames: Record<string, string>
  participantPhotos: Record<string, string>
  lastMessage: string
  lastMessageAt: Timestamp | null
  unreadCounts?: Record<string, number>
}

function formatTime(ts: Timestamp | null) {
  if (!ts) return ""
  return ts.toDate().toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })
}

function formatDay(ts: Timestamp | null) {
  if (!ts) return ""
  const d = ts.toDate()
  const today = new Date()
  if (d.toDateString() === today.toDateString()) return "Today"
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday"
  return d.toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" })
}

function getInitials(name: string) {
  return name.trim().split(" ").filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join("") || "?"
}

function ChatContent() {
  const { user } = useAuth()
  const { chatId } = useParams<{ chatId: string }>()
  const router = useRouter()

  const [messages, setMessages] = useState<Message[]>([])
  const [meta, setMeta] = useState<ChatMeta | null>(null)
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [previewFile, setPreviewFile] = useState<{ file: File; url: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [iBlocked, setIBlocked] = useState(false)
  const [theyBlocked, setTheyBlocked] = useState(false)
  const [blockLoading, setBlockLoading] = useState(false)
  const [showBlockConfirm, setShowBlockConfirm] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const otherUid = meta?.participants.find((p) => p !== user?.uid) || ""
  const otherName = meta?.participantNames?.[otherUid] || "User"
  const otherPhoto = meta?.participantPhotos?.[otherUid] || ""

  // Subscribe to chat meta
  useEffect(() => {
    if (!chatId) return
    const unsub = onSnapshot(doc(db, "chats", chatId), (snap) => {
      if (snap.exists()) setMeta(snap.data() as ChatMeta)
    })
    return () => unsub()
  }, [chatId])

  // Subscribe to messages
  useEffect(() => {
    if (!chatId) return
    const q = query(collection(db, "chats", chatId, "messages"), orderBy("createdAt", "asc"))
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message)))
      setLoading(false)
    }, () => setLoading(false))
    return () => unsub()
  }, [chatId])

  // Mark as read and check blocks on open
  useEffect(() => {
    if (!user || !chatId || !otherUid) return
    // Reset unread count for me
    updateDoc(doc(db, "chats", chatId), {
      [`unreadCounts.${user.uid}`]: 0,
    }).catch(() => {})
    // Check block status
    const checkBlocks = async () => {
      const [iBlockedSnap, theyBlockedSnap] = await Promise.all([
        getDoc(doc(db, "blocks", `${user.uid}_${otherUid}`)),
        getDoc(doc(db, "blocks", `${otherUid}_${user.uid}`)),
      ])
      setIBlocked(iBlockedSnap.exists())
      setTheyBlocked(theyBlockedSnap.exists())
    }
    checkBlocks()
  }, [user, chatId, otherUid])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async (fileUrl?: string, fileType?: string, fileName?: string) => {
    if (!user || (!text.trim() && !fileUrl)) return
    setSending(true)
    try {
      const msgData: Record<string, unknown> = {
        senderId: user.uid,
        createdAt: serverTimestamp(),
      }
      if (text.trim()) msgData.text = text.trim()
      if (fileUrl) { msgData.fileUrl = fileUrl; msgData.fileType = fileType; msgData.fileName = fileName }

      await addDoc(collection(db, "chats", chatId, "messages"), msgData)

      const preview = text.trim() || (fileType === "image" ? "📷 Photo" : `📎 ${fileName || "File"}`)
      await setDoc(doc(db, "chats", chatId), {
        lastMessage: preview,
        lastMessageAt: serverTimestamp(),
        [`unreadCounts.${otherUid}`]: increment(1),
      }, { merge: true })

      setText("")
      setPreviewFile(null)
    } catch (e) { console.error(e) }
    setSending(false)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPreviewFile({ file, url: URL.createObjectURL(file) })
    e.target.value = ""
  }

  const handleSendWithFile = async () => {
    if (!previewFile || !user) return
    setUploading(true)
    try {
      const ext = previewFile.file.name.split(".").pop()?.toLowerCase() || ""
      let fileType: "image" | "pdf" | "doc" | "other" = "other"
      if (["jpg", "jpeg", "png", "gif", "webp", "heic"].includes(ext)) fileType = "image"
      else if (ext === "pdf") fileType = "pdf"
      else if (["doc", "docx", "txt", "ppt", "pptx", "xls", "xlsx"].includes(ext)) fileType = "doc"
      const pathPrefix = `chat-files/${chatId}`
      const downloadUrl = await uploadFile(previewFile.file, pathPrefix)
      await sendMessage(downloadUrl, fileType, previewFile.file.name)
    } catch (e) { console.error(e) }
    setUploading(false)
  }

  const handleSend = () => {
    if (previewFile) handleSendWithFile()
    else sendMessage()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleEditMessage = (msg: Message) => {
    setEditingId(msg.id)
    setEditText(msg.text || "")
  }
  const handleSaveEdit = async () => {
    if (!editingId || !editText.trim()) { setEditingId(null); setEditText(""); return }
    try {
      await updateDoc(doc(db, "chats", chatId!, "messages", editingId), { text: editText.trim() })
      setEditingId(null)
      setEditText("")
    } catch (e) { console.error(e) }
  }
  const handleDeleteMessage = async (msgId: string) => {
    try {
      await deleteDoc(doc(db, "chats", chatId!, "messages", msgId))
      setDeleteConfirmId(null)
    } catch (e) { console.error(e) }
  }

  const handleBlock = async () => {
    if (!user || !otherUid) return
    setBlockLoading(true)
    try {
      if (iBlocked) {
        await deleteDoc(doc(db, "blocks", `${user.uid}_${otherUid}`))
        setIBlocked(false)
      } else {
        await setDoc(doc(db, "blocks", `${user.uid}_${otherUid}`), {
          blockerId: user.uid,
          blockedId: otherUid,
          chatId,
          createdAt: serverTimestamp(),
        })
        setIBlocked(true)
      }
    } catch (e) { console.error(e) }
    setBlockLoading(false)
    setShowBlockConfirm(false)
    setSettingsOpen(false)
  }

  const isBlocked = iBlocked || theyBlocked
  let lastDay = ""

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header — back + name + settings only */}
      <div className="flex items-center gap-3 px-3 py-2.5 border-b bg-background/95 backdrop-blur shrink-0 safe-top">
        <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9" onClick={() => router.push("/messages")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Link href={`/community/${otherUid}`} className="flex items-center gap-2.5 flex-1 min-w-0 hover:opacity-80 transition-opacity">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarImage src={otherPhoto} alt={otherName} referrerPolicy="no-referrer" />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
              {getInitials(otherName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-semibold text-sm leading-tight truncate">{otherName}</p>
            {isBlocked && (
              <p className="text-[11px] text-destructive flex items-center gap-1">
                <Ban className="h-3 w-3" /> {iBlocked ? "Blocked" : "Blocked you"}
              </p>
            )}
          </div>
        </Link>
        {/* Settings */}
        <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle className="text-base">Chat Settings</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-2">
              <Button asChild variant="ghost" className="w-full justify-start gap-2 text-sm">
                <Link href={`/community/${otherUid}`} onClick={() => setSettingsOpen(false)}>
                  <ExternalLink className="h-4 w-4" /> View Profile
                </Link>
              </Button>
              <Button
                variant="ghost"
                className={`w-full justify-start gap-2 text-sm ${iBlocked ? "text-green-600 hover:text-green-700" : "text-destructive hover:text-destructive"}`}
                onClick={() => { setShowBlockConfirm(true); setSettingsOpen(false) }}
              >
                <Ban className="h-4 w-4" />
                {iBlocked ? "Unblock User" : "Block User"}
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-sm text-orange-600 hover:text-orange-700"
                onClick={() => { alert("Report submitted. Our team will review."); setSettingsOpen(false) }}
              >
                <Flag className="h-4 w-4" /> Report User
              </Button>
              <div className="pt-3 border-t">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <ShieldAlert className="h-3.5 w-3.5 inline mr-1 text-amber-500" />
                  All messages are subject to our community guidelines. Misuse may result in suspension.
                </p>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
            <p className="text-sm">No messages yet. Say hi! 👋</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderId === user?.uid
            const dayLabel = formatDay(msg.createdAt)
            const showDay = dayLabel !== lastDay
            if (showDay) lastDay = dayLabel
            const isLast = idx === messages.length - 1

            return (
              <div key={msg.id}>
                {showDay && (
                  <div className="flex justify-center my-4">
                    <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                      {dayLabel}
                    </span>
                  </div>
                )}
                <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-0.5 group/message`}>
                  <div className="flex flex-col items-end gap-0.5 max-w-[78%]">
                    {editingId === msg.id ? (
                      <div className="flex flex-col gap-1.5 w-full rounded-2xl bg-primary/10 dark:bg-primary/20 px-3 py-2 border border-primary/30">
                        <Textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="min-h-[60px] text-sm resize-none bg-background"
                          autoFocus
                        />
                        <div className="flex gap-1 justify-end">
                          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { setEditingId(null); setEditText("") }}>Cancel</Button>
                          <Button size="sm" className="h-7 text-xs" onClick={handleSaveEdit}>Save</Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`rounded-2xl px-3 py-2 text-sm shadow-sm ${
                          isMe
                            ? "bg-primary text-primary-foreground rounded-br-sm"
                            : "bg-muted rounded-bl-sm"
                        }`}
                      >
                        {/* Image */}
                        {msg.fileUrl && msg.fileType === "image" && (
                          <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={msg.fileUrl}
                              alt={msg.fileName || "Image"}
                              className="max-w-full rounded-lg mb-1 max-h-52 object-cover cursor-zoom-in"
                            />
                          </a>
                        )}
                        {/* File */}
                        {msg.fileUrl && msg.fileType !== "image" && (
                          <a
                            href={msg.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={msg.fileName}
                            className="flex items-center gap-2 mb-1 hover:opacity-80"
                          >
                            {msg.fileType === "pdf" ? (
                              <FileText className="h-5 w-5 shrink-0 opacity-80" />
                            ) : (
                              <File className="h-5 w-5 shrink-0 opacity-80" />
                            )}
                            <span className="text-xs underline underline-offset-2 truncate">{msg.fileName || "Download file"}</span>
                            <Download className="h-3.5 w-3.5 shrink-0 opacity-70" />
                          </a>
                        )}
                        {/* Text */}
                        {msg.text && (
                          <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.text}</p>
                        )}
                        <div className={`flex items-center justify-end gap-1 mt-0.5 ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                          <span className="text-[10px]">{formatTime(msg.createdAt)}</span>
                          {isMe && isLast && <CheckCheck className="h-3 w-3" />}
                        </div>
                      </div>
                    )}
                    {/* Edit/Delete menu for own messages */}
                    {isMe && editingId !== msg.id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover/message:opacity-100 transition-opacity text-muted-foreground">
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          {msg.text != null && (
                            <DropdownMenuItem onClick={() => handleEditMessage(msg)}>
                              <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteConfirmId(msg.id)}>
                            <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Blocked banner */}
      {isBlocked && (
        <div className="px-4 py-3 border-t bg-destructive/5 text-center shrink-0">
          <p className="text-sm text-destructive flex items-center justify-center gap-2">
            <Ban className="h-4 w-4" />
            {theyBlocked && !iBlocked
              ? "You can't send messages to this user."
              : "You've blocked this user. Unblock to send messages."}
          </p>
          {iBlocked && (
            <Button variant="outline" size="sm" className="mt-2 text-xs h-7" onClick={() => setShowBlockConfirm(true)}>
              Unblock User
            </Button>
          )}
        </div>
      )}

      {/* Input area: file preview above + bordered input */}
      {!isBlocked && (
        <div className="px-3 py-3 border-t bg-background/95 shrink-0 safe-bottom space-y-2">
          {/* File preview card - above input */}
          {previewFile && (
            <div className="rounded-xl border border-border bg-muted/40 p-3 flex items-start gap-3">
              {previewFile.file.type.startsWith("image/") ? (
                <div className="relative shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewFile.url} alt="Preview" className="h-20 w-20 sm:h-24 sm:w-24 object-cover rounded-lg border border-border" />
                  <Button variant="destructive" size="icon" className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full" onClick={() => setPreviewFile(null)}>
                    <X className="h-2.5 w-2.5" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {previewFile.file.name.toLowerCase().endsWith(".pdf") ? (
                    <FileText className="h-10 w-10 shrink-0 text-red-500" />
                  ) : (
                    <File className="h-10 w-10 shrink-0 text-primary" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{previewFile.file.name}</p>
                    <p className="text-xs text-muted-foreground">{(previewFile.file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setPreviewFile(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Chat input with gradient border (Tailwind) */}
          <div className="relative flex flex-col rounded-xl p-[2px] bg-gradient-to-br from-primary/60 via-primary/20 to-violet-500/40 bg-300 animate-chat-border-glow overflow-hidden focus-within:animate-[chat-border-glow_2s_ease-in-out_infinite]">
            <div className="rounded-[10px] bg-background flex flex-col min-h-0 overflow-hidden">
              <div className="overflow-y-auto min-h-[44px]">
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message…"
                  className="resize-none min-h-[44px] max-h-32 text-sm py-3 px-4 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none bg-transparent"
                  rows={1}
                  disabled={uploading || sending}
                />
              </div>
              <div className="flex items-center justify-between px-2 py-2 border-t border-border/50 bg-muted/20">
              <div className="flex items-center gap-1">
                <input
                  ref={fileRef}
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx"
                  onChange={handleFileSelect}
                />
                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground" onClick={() => fileRef.current?.click()} disabled={uploading} title="Attach file">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground" title="Link" asChild>
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    <Link2 className="h-4 w-4" />
                  </a>
                </Button>
              </div>
              <Button
                variant="ghost"
                onClick={handleSend}
                disabled={sending || uploading || (!text.trim() && !previewFile)}
                size="icon"
                className="h-9 w-9 shrink-0 bg-transparent text-foreground hover:text-foreground hover:bg-accent disabled:text-muted-foreground disabled:opacity-50"
              >
                {(sending || uploading) ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete message confirm */}
      <Dialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete message?</DialogTitle>
            <DialogDescription>This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
            <Button variant="destructive" size="sm" onClick={() => deleteConfirmId && handleDeleteMessage(deleteConfirmId)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block/Unblock confirm dialog */}
      <Dialog open={showBlockConfirm} onOpenChange={setShowBlockConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{iBlocked ? "Unblock User" : "Block User"}</DialogTitle>
            <DialogDescription>
              {iBlocked
                ? `Unblocking ${otherName} will allow them to send you messages again.`
                : `Blocking ${otherName} will prevent them from sending you messages. You can unblock anytime.`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowBlockConfirm(false)}>Cancel</Button>
            <Button
              variant={iBlocked ? "default" : "destructive"}
              size="sm"
              onClick={handleBlock}
              disabled={blockLoading}
            >
              {blockLoading ? "…" : iBlocked ? "Unblock" : "Block User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function ChatPage() {
  return (
    <RequireLogin>
      <ChatContent />
    </RequireLogin>
  )
}
