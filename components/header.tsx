"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { useAuth } from "@/contexts/auth-context"
import { Menu, X, User, LogOut, Shield, MessageCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"
import { db } from "@/lib/firebase"
import { collection, query, where, onSnapshot } from "firebase/firestore"

const NAV_LINKS = [
  { href: "/resources", label: "Resources" },
  { href: "/advice", label: "Advice" },
  { href: "/community", label: "Community" },
]

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [totalUnread, setTotalUnread] = useState(0)
  const lastScrollY = useRef(0)
  const pathname = usePathname()
  const { user, isAdmin, logout } = useAuth()
  const navRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Subscribe to unread message counts
  useEffect(() => {
    if (!user) { setTotalUnread(0); return }
    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", user.uid),
    )
    const unsub = onSnapshot(q, (snap) => {
      let count = 0
      snap.docs.forEach((d) => {
        const data = d.data()
        count += data.unreadCounts?.[user.uid] || 0
      })
      setTotalUnread(count)
    })
    return () => unsub()
  }, [user])

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      if (currentY <= 10) {
        setIsVisible(true)
      } else if (currentY < lastScrollY.current) {
        setIsVisible(true)
      } else if (currentY > lastScrollY.current + 5) {
        setIsVisible(false)
        setIsMenuOpen(false)
      }
      lastScrollY.current = currentY
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => { setIsMenuOpen(false) }, [pathname])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMenuOpen &&
        navRef.current &&
        !navRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isMenuOpen])

  const handleLogout = async () => {
    try { await logout(); setIsMenuOpen(false) }
    catch (error) { console.error("Logout error:", error) }
  }

  const linkClass = (href: string) =>
    `text-sm font-medium transition-colors hover:text-primary ${
      pathname === href || pathname?.startsWith(href + "/") ? "text-primary" : "text-muted-foreground"
    }`

  const MessagesLink = ({ mobile = false }: { mobile?: boolean }) => (
    <Link
      href="/messages"
      className={mobile
        ? `text-sm font-medium flex items-center gap-1.5 ${pathname?.startsWith("/messages") ? "text-primary" : "text-muted-foreground hover:text-primary"}`
        : `${linkClass("/messages")} flex items-center gap-1 relative`
      }
      onClick={() => mobile && setIsMenuOpen(false)}
    >
      <span className="relative">
        <MessageCircle className="h-4 w-4" />
        {totalUnread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground leading-none">
            {totalUnread > 9 ? "9+" : totalUnread}
          </span>
        )}
      </span>
      <span>Messages</span>
    </Link>
  )

  return (
    <header className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-transform duration-300 ${isVisible ? "translate-y-0" : "-translate-y-full"}`}>
      <div className="container flex h-16 items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <Image src="/eduiaol_logo_transparent.png" alt="" width={36} height={36} className="rounded-md shrink-0 w-8 h-8 sm:w-9 sm:h-9" />
            <Image src="/eduiaol_name_transparent.png" alt="Eduiaol" width={80} height={22} className="hidden h-5 w-auto sm:block sm:h-6 object-contain" />
          </Link>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-5">
          {isAdmin && (
            <Link
              href="/admin"
              className={`text-sm font-semibold flex items-center gap-1.5 rounded-md px-2.5 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 ${pathname === "/admin" ? "ring-2 ring-primary ring-offset-2" : ""}`}
            >
              <Shield className="h-4 w-4" /> Admin
            </Link>
          )}
          <Link href="/" className={linkClass("/")}>Home</Link>
          {user && <Link href="/dashboard" className={linkClass("/dashboard")}>Dashboard</Link>}
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={linkClass(l.href)}>{l.label}</Link>
          ))}
          {user && <MessagesLink />}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          <ModeToggle />

          {user ? (
            <div className="hidden md:flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href="/profile" className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                      <Avatar className="h-8 w-8 border border-border">
                        <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? "Profile"} referrerPolicy="no-referrer" />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {user.displayName ? user.displayName[0].toUpperCase() : user.email ? user.email[0].toUpperCase() : <User className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>My Profile</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {isAdmin && (
                <Button asChild variant="default" size="sm" className="gap-1">
                  <Link href="/admin"><Shield className="h-4 w-4" /> Admin</Link>
                </Button>
              )}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={handleLogout}>
                      <LogOut className="h-5 w-5" />
                      <span className="sr-only">Logout</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Logout</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button asChild variant="default" size="sm">
                <Link href="/auth/login">Sign in</Link>
              </Button>
            </div>
          )}

          {/* Mobile menu toggle */}
          <Button
            ref={buttonRef}
            variant="ghost"
            size="icon"
            className="md:hidden relative"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            {!isMenuOpen && totalUnread > 0 && (
              <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-destructive border-2 border-background" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile nav */}
      {isMenuOpen && (
        <div ref={navRef} className="md:hidden border-t animate-in slide-in-from-top duration-300">
          <div className="container py-4 flex flex-col gap-3">
            {isAdmin && (
              <Link
                href="/admin"
                className="text-sm font-semibold flex items-center gap-1.5 rounded-md px-2.5 py-1.5 bg-primary text-primary-foreground w-fit"
                onClick={() => setIsMenuOpen(false)}
              >
                <Shield className="h-4 w-4" /> Admin
              </Link>
            )}
            <Link href="/" className={`text-sm font-medium ${pathname === "/" ? "text-primary" : "text-muted-foreground"}`} onClick={() => setIsMenuOpen(false)}>Home</Link>
            {user && (
              <Link href="/dashboard" className={`text-sm font-medium ${pathname?.startsWith("/dashboard") ? "text-primary" : "text-muted-foreground"}`} onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
            )}
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className={`text-sm font-medium ${pathname === l.href ? "text-primary" : "text-muted-foreground hover:text-primary"}`} onClick={() => setIsMenuOpen(false)}>
                {l.label}
              </Link>
            ))}
            {user && <MessagesLink mobile />}

            {user ? (
              <div className="flex flex-col gap-2 pt-2 border-t mt-1">
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? "Profile"} referrerPolicy="no-referrer" />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {user.displayName ? user.displayName[0].toUpperCase() : user.email ? user.email[0].toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                  {user.displayName || (user.email ? user.email.split("@")[0] : "Profile")}
                </div>
                <Link href="/profile" className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                  <User className="h-4 w-4" /> My Profile
                </Link>
                <Button
                  variant="ghost"
                  className="justify-start p-0 h-auto font-medium text-sm text-muted-foreground hover:text-primary"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" /> Logout
                </Button>
              </div>
            ) : (
              <div className="pt-2 border-t">
                <Button asChild className="w-full" onClick={() => setIsMenuOpen(false)}>
                  <Link href="/auth/login">Sign in</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
