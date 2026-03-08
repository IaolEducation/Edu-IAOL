import type { Metadata } from "next"
import RequireLogin from "@/components/require-login"
import SubmitPageClient from "./submit-page-client"

export const metadata: Metadata = {
  title: "Share | Eduiaol",
  description: "Share your placement experience, notes, or resources",
}

export default function SubmitPage() {
  return (
    <RequireLogin>
      <SubmitPageClient />
    </RequireLogin>
  )
}
