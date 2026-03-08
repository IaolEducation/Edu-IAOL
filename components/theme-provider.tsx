"use client"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      themes={["light", "dark", "nith-theme", "system"]}
      defaultTheme="nith-theme"
      enableSystem={true}
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}

