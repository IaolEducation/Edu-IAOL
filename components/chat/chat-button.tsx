"use client"

import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export function ChatButton() {
  return (
    <motion.div
      className="fixed bottom-4 right-4 z-40 shadow-lg"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <Button asChild size="lg" className="h-14 w-14 rounded-full shadow-lg relative">
        <Link href="/messages" aria-label="Messages">
          <MessageCircle className="h-6 w-6" />
        </Link>
      </Button>
    </motion.div>
  )
}
