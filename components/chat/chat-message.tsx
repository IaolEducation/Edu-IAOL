"use client"

import { useState } from "react"
import { Copy, Check, Bot, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { motion } from "framer-motion"
import { CodeBlock } from "./code-block"

type MessageContent =
  | string
  | {
      type: "text" | "code"
      content: string
      language?: string
      fileName?: string
    }[]

type MessageProps = {
  role: "user" | "assistant" | "system"
  content: MessageContent
  timestamp?: Date
  model?: string
}

export function ChatMessage({ role, content, timestamp, model }: MessageProps) {
  const [copied, setCopied] = useState(false)

  if (role === "system") return null

  const isUser = role === "user"

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Function to get plain text content for copying
  const getPlainTextContent = (content: MessageContent): string => {
    if (typeof content === "string") {
      return content
    }

    return content
      .map((part) => {
        if (typeof part === "string") return part
        return part.content
      })
      .join("\n\n")
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("flex w-full mb-4", isUser ? "justify-end" : "justify-start")}
    >
      <div className={cn("flex gap-3 max-w-[85%]", isUser ? "flex-row-reverse" : "flex-row")}>
        <div
          className={cn(
            "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
            isUser ? "bg-primary" : "bg-primary/10",
          )}
        >
          {isUser ? <User size={16} className="text-primary-foreground" /> : <Bot size={16} className="text-primary" />}
        </div>

        <div
          className={cn(
            "rounded-2xl p-4 flex flex-col gap-2 overflow-hidden",
            isUser ? "bg-primary text-primary-foreground" : "bg-muted",
          )}
        >
          {/* Render content based on type */}
          {typeof content === "string" ? (
            <div className="break-words whitespace-pre-wrap text-sm">{content}</div>
          ) : (
            <div className="flex flex-col gap-4">
              {content.map((part, index) => {
                if (typeof part === "string") {
                  return (
                    <div key={index} className="break-words whitespace-pre-wrap text-sm">
                      {part}
                    </div>
                  )
                }

                if (part.type === "text") {
                  return (
                    <div key={index} className="break-words whitespace-pre-wrap text-sm">
                      {part.content}
                    </div>
                  )
                }

                if (part.type === "code") {
                  return (
                    <div key={index} className="max-w-full overflow-x-auto">
                      <CodeBlock code={part.content} language={part.language || "plaintext"} fileName={part.fileName} />
                    </div>
                  )
                }

                return null
              })}
            </div>
          )}

          <div className="flex items-center justify-between mt-1 text-xs opacity-70">
            <div className="flex items-center gap-1">
              {timestamp && <span>{format(timestamp, "h:mm a")}</span>}
              {model && !isUser && (
                <span className="ml-2 px-1.5 py-0.5 rounded-full bg-background/50 text-[10px]">
                  {model.split("/")[1] || model}
                </span>
              )}
            </div>

            {!isUser && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full opacity-70 hover:opacity-100"
                onClick={() => copyToClipboard(getPlainTextContent(content))}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                <span className="sr-only">Copy message</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

