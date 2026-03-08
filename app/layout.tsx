import type React from "react"
import "./globals.css"
import "./mobile-fixes.css"
import "./code-styles.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/toaster"
import DataInitializer from "@/components/data-initializer"
import PwaRegister from "@/components/pwa-register"
import { ChatProvider } from "@/providers/chat-provider"
import { Chat } from "@/components/chat/chat"
import { AppShell } from "@/components/app-shell"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Eduiaol | JEE, NEET & Career Guidance",
  description: "Eduiaol – Affiliated with IAOL Education. Counselling thousands of JEE, NEET & other stream students. Kargil, Ladakh. Contact: iaoleducation65@gmail.com",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Eduiaol" },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0f172a" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ChatProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <Chat />
            <AuthProvider>
              <PwaRegister />
              <DataInitializer />
              <AppShell>{children}</AppShell>
              <Toaster />
            </AuthProvider>
          </ThemeProvider>
        </ChatProvider>
      </body>
    </html>
  )
}

