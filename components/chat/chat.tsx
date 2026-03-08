"use client"

import { ChatButton } from "./chat-button"
import { usePathname } from "next/navigation"

export function Chat() {
  const pathname = usePathname()

  if (pathname.startsWith("/messages")) return null

  return <ChatButton />
}

