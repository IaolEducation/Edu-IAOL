"use client"

import type React from "react"
import { useRef, useEffect, useState } from "react"
import { useChat } from "@/providers/chat-provider"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  X,
  Send,
  Trash2,
  Minimize2,
  Maximize2,
  Loader2,
  GraduationCap,
  MessageSquare,
  Briefcase,
  Settings,
} from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { ModelSelector } from "./model-selector"
import { ChatMessage } from "./chat-message"
import { PlacementResources } from "./placement-resources"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const STUDY_SUGGESTIONS = [
  {
    category: "Academic",
    icon: <GraduationCap className="h-4 w-4" />,
    questions: [
      "Explain the concept of derivatives in calculus",
      "What are the key principles of object-oriented programming?",
      "How does machine learning work?",
      "What is the difference between RAM and ROM?",
    ],
  },
  {
    category: "Placement",
    icon: <Briefcase className="h-4 w-4" />,
    questions: [
      "How do I prepare for a technical interview?",
      "What should I include in my resume as a computer science student?",
      "What are common behavioral interview questions?",
      "How can I improve my problem-solving skills for coding interviews?",
    ],
  },
  {
    category: "Coding",
    icon: <MessageSquare className="h-4 w-4" />,
    questions: [
      "Write a Python function to check if a string is a palindrome",
      "Explain how to implement a binary search algorithm",
      "What's the difference between SQL and NoSQL databases?",
      "How do I create a responsive website using CSS Grid?",
    ],
  },
]

export function ChatInterface() {
  const {
    messages,
    addMessage,
    isLoading,
    closeChat,
    clearMessages,
    isMinimized,
    isFullScreen,
    toggleMinimized,
    toggleFullScreen,
    error,
    selectedModel,
    setSelectedModel,
    activeTab,
    setActiveTab,
  } = useChat()

  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Detect mobile viewport
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!isMinimized) {
      inputRef.current?.focus()
    }
  }, [isMinimized])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      addMessage({ role: "user", content: input.trim() })
      setInput("")
    }
  }

  const handleSuggestionClick = (question: string) => {
    if (!isLoading) {
      addMessage({ role: "user", content: question })
      setActiveTab("chat")
    }
  }

  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="fixed bottom-20 right-4 z-50 bg-background rounded-lg shadow-lg border p-3 w-72 max-w-[calc(100vw-2rem)]"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <GraduationCap size={16} className="text-primary-foreground" />
            </div>
            <h3 className="font-medium">College Assistant</h3>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={toggleMinimized} className="h-7 w-7">
              <Maximize2 size={14} />
              <span className="sr-only">Expand</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={closeChat} className="h-7 w-7">
              <X size={14} />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <Loader2 size={12} className="animate-spin" />
            <span>AI is thinking...</span>
          </div>
        )}
      </motion.div>
    )
  }

  // On mobile: near-full-screen chat. On desktop: fixed 420×560 panel.
  const chatStyle: React.CSSProperties = isFullScreen
    ? {}
    : isMobile
      ? {
          width: "calc(100vw - 1rem)",
          height: "calc(100dvh - 6rem)",
          maxWidth: "100vw",
        }
      : {
          width: 420,
          height: 560,
          maxWidth: "calc(100vw - 2rem)",
          maxHeight: "calc(100vh - 6rem)",
        }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className={cn(
          "fixed z-50 bg-background/95 backdrop-blur-sm flex flex-col shadow-xl border",
          isFullScreen
            ? "inset-0 pt-16"
            : isMobile
              ? "bottom-20 left-2 right-2 rounded-xl overflow-hidden"
              : "bottom-20 right-4 rounded-xl overflow-hidden",
        )}
        style={!isFullScreen ? chatStyle : undefined}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <GraduationCap size={16} className="text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-sm truncate">College Assistant</h2>
              <p className="text-xs text-muted-foreground truncate">Powered by AI</p>
            </div>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Settings size={14} />
                  <span className="sr-only">Settings</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[300px] max-w-[90vw]">
                <div className="p-2">
                  <h4 className="text-sm font-medium mb-2">Select AI Model</h4>
                  <ModelSelector selectedModel={selectedModel} onSelectModel={setSelectedModel} />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={clearMessages} className="h-7 w-7">
                    <Trash2 size={14} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Clear chat</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={toggleMinimized} className="h-7 w-7">
                    <Minimize2 size={14} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Minimize</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={toggleFullScreen} className="h-7 w-7">
                    {isFullScreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isFullScreen ? "Exit full screen" : "Full screen"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={closeChat} className="h-7 w-7">
                    <X size={14} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Close chat</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "chat" | "resources")}
          className="flex-1 flex flex-col min-h-0"
        >
          <TabsList className="grid grid-cols-2 px-4 pt-2 flex-shrink-0">
            <TabsTrigger value="chat" className="flex items-center gap-1">
              <MessageSquare size={14} />
              <span>Chat</span>
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-1">
              <Briefcase size={14} />
              <span>Placement</span>
            </TabsTrigger>
          </TabsList>

          {/* Chat Tab */}
          <TabsContent value="chat" className="flex-1 flex flex-col min-h-0 data-[state=inactive]:hidden">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-3 min-h-0">
              <div className="space-y-2">
                <AnimatePresence>
                  {messages.length === 1 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center my-6 px-2"
                    >
                      <div className="h-14 w-14 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                        <GraduationCap size={28} className="text-primary" />
                      </div>
                      <h3 className="text-lg font-bold mb-1">College Assistant</h3>
                      <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-4">
                        Ask me anything about your studies, career, or coding.
                      </p>

                      <Tabs defaultValue="academic" className="w-full">
                        <TabsList className="grid grid-cols-3 w-full">
                          {STUDY_SUGGESTIONS.map((cat) => (
                            <TabsTrigger key={cat.category} value={cat.category.toLowerCase()} className="text-xs px-1">
                              <span className="flex items-center gap-1">
                                {cat.icon}
                                <span className="hidden sm:inline">{cat.category}</span>
                              </span>
                            </TabsTrigger>
                          ))}
                        </TabsList>

                        {STUDY_SUGGESTIONS.map((cat) => (
                          <TabsContent key={cat.category} value={cat.category.toLowerCase()} className="mt-2">
                            <div className="grid grid-cols-1 gap-1.5">
                              {cat.questions.map((question, idx) => (
                                <Button
                                  key={idx}
                                  variant="outline"
                                  className="text-xs justify-start h-auto py-2 px-3 text-left whitespace-normal"
                                  onClick={() => handleSuggestionClick(question)}
                                >
                                  {question}
                                </Button>
                              ))}
                            </div>
                          </TabsContent>
                        ))}
                      </Tabs>
                    </motion.div>
                  )}
                </AnimatePresence>

                {messages
                  .filter((m) => m.role !== "system")
                  .map((message, index) => (
                    <ChatMessage
                      key={index}
                      role={message.role}
                      content={message.content}
                      timestamp={message.timestamp}
                      model={message.model}
                    />
                  ))}

                {isLoading && (
                  <div className="flex w-full mb-4 justify-start">
                    <div className="flex gap-2 max-w-[80%]">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <Loader2 size={16} className="text-primary animate-spin" />
                      </div>
                      <div className="rounded-lg p-3 text-sm bg-muted">
                        <span>Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">
                    <strong>Error:</strong> {error}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-3 border-t flex-shrink-0">
              <div className="relative">
                <Textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about academics, career, or coding..."
                  className="pr-10 resize-none min-h-[52px] max-h-32 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit(e)
                    }
                  }}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 bottom-2 h-8 w-8"
                >
                  {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  <span className="sr-only">Send message</span>
                </Button>
              </div>
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-muted-foreground">Enter to send · Shift+Enter for newline</p>
                <p className="text-xs text-muted-foreground truncate ml-2 max-w-[120px]">{selectedModel.name}</p>
              </div>
            </form>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="flex-1 overflow-y-auto p-4 data-[state=inactive]:hidden">
            <PlacementResources />
          </TabsContent>
        </Tabs>
      </motion.div>
    </AnimatePresence>
  )
}
