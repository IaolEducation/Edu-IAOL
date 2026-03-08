"use client"

import { useEffect, useState } from "react"
import { X, Download, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"

const STORAGE_KEY = "pwa-install-dismissed"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Don't show if already dismissed/installed
    if (typeof window === "undefined") return
    if (localStorage.getItem(STORAGE_KEY)) return

    // Already installed as standalone — skip
    if (window.matchMedia("(display-mode: standalone)").matches) return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Small delay so the page loads first
      setTimeout(() => setShow(true), 2500)
    }

    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === "accepted") {
      localStorage.setItem(STORAGE_KEY, "installed")
    }
    setShow(false)
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "dismissed")
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[200] w-[calc(100%-2rem)] max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="relative rounded-2xl border bg-background shadow-xl p-4 flex items-start gap-3">
        {/* Icon */}
        <div className="shrink-0 h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Smartphone className="h-5 w-5 text-primary" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm leading-tight">Install IAOL Education</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
            Add to your home screen for quick access and offline use.
          </p>
          <div className="flex gap-2 mt-3">
            <Button size="sm" className="h-8 text-xs gap-1.5 flex-1" onClick={handleInstall}>
              <Download className="h-3.5 w-3.5" /> Install App
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={handleDismiss}>
              Not now
            </Button>
          </div>
        </div>

        {/* Close */}
        <button
          onClick={handleDismiss}
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
