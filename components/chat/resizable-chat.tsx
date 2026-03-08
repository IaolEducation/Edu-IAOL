"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { ArrowUpIcon as ArrowsOut, X, Maximize2, Loader2, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useChat } from "@/providers/chat-provider"

interface ResizableChatProps {
  children: React.ReactNode
  defaultWidth?: number
  defaultHeight?: number
  minWidth?: number
  minHeight?: number
}

export function ResizableChat({
  children,
  defaultWidth = 400,
  defaultHeight = 500,
  minWidth = 300,
  minHeight = 400,
}: ResizableChatProps) {
  const { isMinimized, isFullScreen, toggleMinimized, toggleFullScreen, closeChat, isLoading } = useChat()

  const [size, setSize] = useState({ width: defaultWidth, height: defaultHeight })
  const [position, setPosition] = useState({ right: 16, bottom: 80 })
  const [isResizing, setIsResizing] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const resizeStartRef = useRef({ x: 0, y: 0 })
  const initialSizeRef = useRef({ width: 0, height: 0 })
  const initialPositionRef = useRef({ right: 0, bottom: 0 })

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsResizing(true)

    // Get starting position
    if ("touches" in e) {
      resizeStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      }
    } else {
      resizeStartRef.current = {
        x: e.clientX,
        y: e.clientY,
      }
    }

    // Store initial size and position
    initialSizeRef.current = { ...size }
    initialPositionRef.current = { ...position }

    // Add document event listeners
    document.addEventListener("mousemove", handleResizeMove)
    document.addEventListener("touchmove", handleResizeTouchMove, { passive: false })
    document.addEventListener("mouseup", handleResizeEnd)
    document.addEventListener("touchend", handleResizeEnd)
  }

  // Handle resize move (mouse)
  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing) return

    const deltaX = e.clientX - resizeStartRef.current.x
    const deltaY = e.clientY - resizeStartRef.current.y

    // For top-left resize, we need to adjust both position and size
    const newWidth = Math.max(minWidth, initialSizeRef.current.width - deltaX)
    const newHeight = Math.max(minHeight, initialSizeRef.current.height - deltaY)

    // Calculate new position (right and bottom stay fixed, left and top change)
    const newRight = initialPositionRef.current.right
    const newBottom = initialPositionRef.current.bottom

    setSize({ width: newWidth, height: newHeight })
    setPosition({ right: newRight, bottom: newBottom })
  }

  // Handle resize move (touch)
  const handleResizeTouchMove = (e: TouchEvent) => {
    e.preventDefault() // Prevent scrolling while resizing
    if (!isResizing) return

    const deltaX = e.touches[0].clientX - resizeStartRef.current.x
    const deltaY = e.touches[0].clientY - resizeStartRef.current.y

    // For top-left resize, we need to adjust both position and size
    const newWidth = Math.max(minWidth, initialSizeRef.current.width - deltaX)
    const newHeight = Math.max(minHeight, initialSizeRef.current.height - deltaY)

    // Calculate new position (right and bottom stay fixed, left and top change)
    const newRight = initialPositionRef.current.right
    const newBottom = initialPositionRef.current.bottom

    setSize({ width: newWidth, height: newHeight })
    setPosition({ right: newRight, bottom: newBottom })
  }

  // Handle resize end
  const handleResizeEnd = () => {
    setIsResizing(false)

    // Remove document event listeners
    document.removeEventListener("mousemove", handleResizeMove)
    document.removeEventListener("touchmove", handleResizeTouchMove)
    document.removeEventListener("mouseup", handleResizeEnd)
    document.removeEventListener("touchend", handleResizeEnd)
  }

  // Clean up event listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleResizeMove)
      document.removeEventListener("touchmove", handleResizeTouchMove)
      document.removeEventListener("mouseup", handleResizeEnd)
      document.removeEventListener("touchend", handleResizeEnd)
    }
  }, [])

  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="fixed bottom-20 right-4 z-50 bg-background rounded-lg shadow-lg border p-3 w-72 max-w-[90vw]"
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

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        ref={containerRef}
        className={cn(
          "fixed z-50 bg-background/95 backdrop-blur-sm flex flex-col shadow-lg border",
          isFullScreen
            ? "inset-0 pt-16" // Add padding top to avoid header overlap
            : "rounded-lg overflow-hidden",
        )}
        style={
          !isFullScreen
            ? {
                width: size.width,
                height: size.height,
                right: position.right,
                bottom: position.bottom,
              }
            : undefined
        }
      >
        {/* Resize handle (only in non-fullscreen mode) */}
        {!isFullScreen && (
          <div
            className="absolute top-0 left-0 w-8 h-8 cursor-nw-resize z-[60] flex items-center justify-center bg-background/80 hover:bg-background rounded-br-md border-r border-b"
            onMouseDown={handleResizeStart}
            onTouchStart={handleResizeStart}
          >
            <ArrowsOut size={14} className="text-muted-foreground" />
          </div>
        )}

        {children}
      </motion.div>
    </AnimatePresence>
  )
}

