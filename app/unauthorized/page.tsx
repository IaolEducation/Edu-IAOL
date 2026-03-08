import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function UnauthorizedPage() {
  return (
    <div className="container py-12">
      <div className="max-w-md mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            <p className="mb-4">You don't have permission to access this page.</p>
            <p className="mb-4">
              This area is restricted to administrators only. If you believe you should have access, please visit the
              admin setup page.
            </p>
            <div className="flex gap-2 mt-4">
              <Button asChild variant="outline" size="sm">
                <Link href="/">Return to Home</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/admin-setup">Admin Setup</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}

