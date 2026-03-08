"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import { type AIModel, AI_MODELS } from "@/components/chat/model-selector"

type MessageContent =
  | string
  | {
      type: "text" | "code"
      content: string
      language?: string
      fileName?: string
    }

type Message = {
  role: "user" | "assistant" | "system"
  content: MessageContent
  timestamp?: Date
  model?: string
}

type ChatContextType = {
  messages: Message[]
  addMessage: (message: Message) => void
  isLoading: boolean
  isChatOpen: boolean
  isMinimized: boolean
  isFullScreen: boolean
  selectedModel: AIModel
  setSelectedModel: (model: AIModel) => void
  activeTab: "chat" | "resources"
  setActiveTab: (tab: "chat" | "resources") => void
  toggleChat: () => void
  closeChat: () => void
  clearMessages: () => void
  toggleMinimized: () => void
  toggleFullScreen: () => void
  error: string | null
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

// Update the DEFAULT_SYSTEM_MESSAGE to be more general-purpose
const DEFAULT_SYSTEM_MESSAGE = `You are a helpful AI assistant designed specifically for college students. You can:

1. Answer academic questions across various subjects
2. Provide study tips and learning strategies
3. Help with career planning and placement preparation
4. Assist with resume building and interview preparation
5. Offer coding help and explain programming concepts
6. Provide information about companies and job opportunities

When providing code examples, format them properly with the appropriate language syntax. Be concise, accurate, and educational in your responses. If you don't know something, admit it rather than making up information.

For coding questions, provide well-commented code with explanations. For placement-related questions, offer practical, actionable advice.`

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content: DEFAULT_SYSTEM_MESSAGE,
      timestamp: new Date(),
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState<AIModel>(AI_MODELS[0])
  const [activeTab, setActiveTab] = useState<"chat" | "resources">("chat")

  const toggleChat = () => {
    if (!isChatOpen) {
      setIsMinimized(false)
    }
    setIsChatOpen((prev) => !prev)
  }

  const closeChat = () => {
    setIsChatOpen(false)
  }

  const toggleMinimized = () => {
    setIsMinimized((prev) => !prev)
    if (isFullScreen && !isMinimized) {
      setIsFullScreen(false)
    }
  }

  const toggleFullScreen = () => {
    setIsFullScreen((prev) => !prev)
    if (isMinimized && !isFullScreen) {
      setIsMinimized(false)
    }
  }

  const clearMessages = () => {
    setMessages([
      {
        role: "system",
        content: DEFAULT_SYSTEM_MESSAGE,
        timestamp: new Date(),
      },
    ])
    setError(null)
  }

  // Function to parse code blocks from the AI response
  const parseCodeBlocks = (text: string): MessageContent[] => {
    const codeBlockRegex = /```(\w+)?\s*(?:\n)?([^`]+)```/g
    const parts: MessageContent[] = []
    let lastIndex = 0
    let match

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: text.substring(lastIndex, match.index),
        })
      }

      // Add code block
      const language = match[1] || "plaintext"
      const code = match[2].trim()
      parts.push({
        type: "code",
        content: code,
        language,
      })

      lastIndex = match.index + match[0].length
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: "text",
        content: text.substring(lastIndex),
      })
    }

    return parts
  }

  const addMessage = async (message: Message) => {
    const messageWithTimestamp = {
      ...message,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, messageWithTimestamp])
    setError(null)

    if (message.role === "user") {
      setIsLoading(true)

      // Timeout guard — use a ref flag so the closure always sees current state
      let timedOut = false
      const timeoutId = setTimeout(() => {
        timedOut = true
        setIsLoading(false)
        setError("Request timed out. Please try again.")
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Sorry, the request timed out. Please try again.",
            timestamp: new Date(),
          },
        ])
      }, 60000)

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [...messages, messageWithTimestamp],
            model: selectedModel.id,
          }),
        })

        clearTimeout(timeoutId)
        if (timedOut) return

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.details || "Failed to fetch response")
        }

        const data = await response.json()
        const content = data.content

        // Check if the response contains code blocks
        if (content.includes("```")) {
          const parsedContent = parseCodeBlocks(content)
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: parsedContent.length === 1 ? parsedContent[0].content : parsedContent,
              timestamp: new Date(),
              model: data.model,
            },
          ])
        } else {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: content,
              timestamp: new Date(),
              model: data.model,
            },
          ])
        }
      } catch (error) {
        clearTimeout(timeoutId)
        console.error("Error fetching AI response:", error)
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
        setError(errorMessage)
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Sorry, I encountered an error. ${errorMessage}`,
            timestamp: new Date(),
          },
        ])
      } finally {
        clearTimeout(timeoutId)
        setIsLoading(false)
      }
    }
  }

  return (
    <ChatContext.Provider
      value={{
        messages,
        addMessage,
        isLoading,
        isChatOpen,
        isMinimized,
        isFullScreen,
        selectedModel,
        setSelectedModel,
        activeTab,
        setActiveTab,
        toggleChat,
        closeChat,
        clearMessages,
        toggleMinimized,
        toggleFullScreen,
        error,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}

