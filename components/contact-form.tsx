"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle } from "lucide-react"

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const formElement = e.currentTarget
      const formData = new FormData(formElement)

      // Submit the form to formsubmit.co
      const response = await fetch(`https://formsubmit.co/talibhassan1122@gmail.com`, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to submit the form. Please try again.")
      }

      setIsSubmitted(true)
      formElement.reset()
    } catch (error) {
      console.error("Error submitting form:", error)
      setError(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <Alert className="bg-green-50 text-green-800 border-green-200">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle>Message Sent!</AlertTitle>
        <AlertDescription>Your message has been sent successfully! We'll get back to you soon.</AlertDescription>
        <Button onClick={() => setIsSubmitted(false)} variant="outline" className="mt-4 bg-white hover:bg-green-50">
          Send Another Message
        </Button>
      </Alert>
    )
  }

  return (
    <form
      action="https://formsubmit.co/talibhassan1122@gmail.com"
      method="POST"
      onSubmit={handleSubmit}
      className="space-y-4 w-full"
    >
      {/* Honeypot field to prevent spam */}
      <input type="text" name="_honey" style={{ display: "none" }} />

      {/* Disable captcha */}
      <input type="hidden" name="_captcha" value="false" />

      {/* Request JSON response instead of redirect */}
      <input type="hidden" name="_format" value="json" />

      {/* Template subject */}
      <input type="hidden" name="_subject" value="New Contact Form Submission - Eduiaol" />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Name
          </Label>
          <Input id="name" name="name" placeholder="Your name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email
          </Label>
          <Input id="email" name="email" type="email" placeholder="Your email" required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject" className="text-sm font-medium">
          Subject
        </Label>
        <Input id="subject" name="subject" placeholder="Subject of your message" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message" className="text-sm font-medium">
          Message
        </Label>
        <Textarea id="message" name="message" placeholder="Your message" className="min-h-[150px]" required />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send Message"}
      </Button>
    </form>
  )
}

