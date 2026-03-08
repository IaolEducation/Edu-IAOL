"use client"

import { useChat } from "@/providers/chat-provider"
import { ChatButton } from "./chat-button"
import { ChatInterface } from "./chat-interface"
import { AnimatePresence } from "framer-motion"

export function Chat() {
  const { isChatOpen } = useChat()

  return (
    <>
      <ChatButton />
      <AnimatePresence>{isChatOpen && <ChatInterface />}</AnimatePresence>
    </>
  )
}

