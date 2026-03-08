"use client"

import { useState } from "react"
import { Check, Copy, Download, Terminal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism"

interface CodeBlockProps {
  code: string
  language?: string
  fileName?: string
}

export function CodeBlock({ code, language = "plaintext", fileName }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadCode = () => {
    const element = document.createElement("a")
    const file = new Blob([code], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = fileName || `code.${language}`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="rounded-md overflow-hidden border border-border bg-black text-white w-full max-w-full">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900">
        <div className="flex items-center gap-2">
          <Terminal size={14} />
          <span className="text-xs font-medium">{fileName || language}</span>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800"
            onClick={copyToClipboard}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span className="sr-only">Copy code</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800"
            onClick={downloadCode}
          >
            <Download size={14} />
            <span className="sr-only">Download code</span>
          </Button>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <SyntaxHighlighter
          language={language}
          style={atomDark}
          customStyle={{
            margin: 0,
            padding: "1rem",
            fontSize: "0.875rem",
            lineHeight: 1.5,
            maxWidth: "100%",
          }}
          showLineNumbers
          wrapLongLines
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}

