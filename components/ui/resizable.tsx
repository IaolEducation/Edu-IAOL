"use client"

import { GripVertical } from "lucide-react"
import * as ResizablePrimitive from "react-resizable-panels"

import { cn } from "@/lib/utils"
import type React from "react"
import { useState, useRef, useEffect } from "react"

const ResizablePanelGroup = ({ className, ...props }: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) => (
  <ResizablePrimitive.PanelGroup
    className={cn("flex h-full w-full data-[panel-group-direction=vertical]:flex-col", className)}
    {...props}
  />
)

const ResizablePanel = ResizablePrimitive.Panel

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean
}) => (
  <ResizablePrimitive.PanelResizeHandle
    className={cn(
      "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",
      className,
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
        <GripVertical className="h-2.5 w-2.5" />
      </div>
    )}
  </ResizablePrimitive.PanelResizeHandle>
)

interface ResizableProps {
  children: React.ReactNode
  className?: string
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  defaultWidth?: number
  defaultHeight?: number
  isFullScreen?: boolean
  onResize?: (width: number, height: number) => void
}

export function Resizable({
  children,
  className,
  minWidth = 300,
  minHeight = 400,
  maxWidth = window.innerWidth * 0.95,
  maxHeight = window.innerHeight * 0.9,
  defaultWidth = 400,
  defaultHeight = 500,
  isFullScreen = false,
  onResize,
}: ResizableProps) {
  const [dimensions, setDimensions] = useState({
    width: defaultWidth,
    height: defaultHeight,
  })
  const [isResizing, setIsResizing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const startPosRef = useRef({ x: 0, y: 0 })
  const startDimensionsRef = useRef({ width: 0, height: 0 })

  // Update max dimensions on window resize
  useEffect(() => {
    const handleWindowResize = () => {
      if (!isFullScreen) {
        setDimensions((prev) => ({
          width: Math.min(prev.width, window.innerWidth * 0.95),
          height: Math.min(prev.height, window.innerHeight * 0.9),
        }))
      }
    }

    window.addEventListener("resize", handleWindowResize)
    return () => window.removeEventListener("resize", handleWindowResize)
  }, [isFullScreen])

  // Handle mouse down on resize handle
  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsResizing(true)

    // Get starting position
    if ("touches" in e) {
      startPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    } else {
      startPosRef.current = { x: e.clientX, y: e.clientY }
    }

    startDimensionsRef.current = { ...dimensions }

    // Add event listeners
    if ("touches" in e) {
      document.addEventListener("touchmove", handleResizeMove)
      document.addEventListener("touchend", handleResizeEnd)
    } else {
      document.addEventListener("mousemove", handleResizeMove)
      document.addEventListener("mouseup", handleResizeEnd)
    }
  }

  // Handle mouse move during resize
  const handleResizeMove = (e: MouseEvent | TouchEvent) => {
    if (!isResizing) return

    let clientX, clientY
    if ("touches" in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    const deltaX = clientX - startPosRef.current.x
    const deltaY = clientY - startPosRef.current.y

    const newWidth = Math.max(minWidth, Math.min(maxWidth, startDimensionsRef.current.width + deltaX))

    const newHeight = Math.max(minHeight, Math.min(maxHeight, startDimensionsRef.current.height + deltaY))

    setDimensions({ width: newWidth, height: newHeight })

    if (onResize) {
      onResize(newWidth, newHeight)
    }
  }

  // Handle mouse up after resize
  const handleResizeEnd = () => {
    setIsResizing(false)
    document.removeEventListener("mousemove", handleResizeMove)
    document.removeEventListener("mouseup", handleResizeEnd)
    document.removeEventListener("touchmove", handleResizeMove)
    document.removeEventListener("touchend", handleResizeEnd)
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative", isResizing && "select-none", className)}
      style={isFullScreen ? { width: "100%", height: "100%" } : { width: dimensions.width, height: dimensions.height }}
    >
      {children}

      {!isFullScreen && (
        <div
          className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize z-50"
          onMouseDown={handleResizeStart}
          onTouchStart={handleResizeStart}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute bottom-1 right-1"
          >
            <path
              d="M8 8L14 14M10 14H14V10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </div>
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }

