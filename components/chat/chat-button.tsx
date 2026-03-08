"use client"

import { Button } from "@/components/ui/button"
import { useChat } from "@/providers/chat-provider"
import { GraduationCap } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function ChatButton() {
  const { toggleChat, isChatOpen, isLoading } = useChat()

  return (
    <AnimatePresence>
      {!isChatOpen && (
        <motion.div
          className="fixed bottom-4 right-4 z-40 shadow-lg"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <Button onClick={toggleChat} size="lg" className="h-14 w-14 rounded-full shadow-lg relative">
            <GraduationCap className="h-6 w-6" />
            <span className="sr-only">Open Chat</span>

            {isLoading && (
              <motion.div
                className="absolute inset-0 rounded-full"
                initial={{ borderWidth: 2 }}
                animate={{
                  rotate: 360,
                  borderTopColor: "rgba(255, 255, 255, 0.5)",
                  borderRightColor: "transparent",
                  borderBottomColor: "transparent",
                  borderLeftColor: "transparent",
                }}
                transition={{
                  duration: 1,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
                style={{
                  borderStyle: "solid",
                }}
              />
            )}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

