import type React from "react"
import "./globals.css"
import "./mobile-fixes.css"
import "./code-styles.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/toaster"
import Header from "@/components/header"
import Footer from "@/components/footer"
import DataInitializer from "@/components/data-initializer"
import PwaRegister from "@/components/pwa-register"
import { ChatProvider } from "@/providers/chat-provider"
import { Chat } from "@/components/chat/chat"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Eduiaol | JEE, NEET & Career Guidance",
  description: "Eduiaol – Affiliated with IAOL Education. Counselling thousands of JEE, NEET & other stream students. Kargil, Ladakh. Contact: iaoleducation65@gmail.com",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Eduiaol" },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0f172a" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
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
              <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
              <Toaster />
            </AuthProvider>
          </ThemeProvider>
        </ChatProvider>
      </body>
    </html>
  )
}

