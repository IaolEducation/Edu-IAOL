"use client"

import { useTheme } from "next-themes"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Monitor } from "lucide-react"

export function ThemeShowcase() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button variant={theme === "light" ? "default" : "outline"} onClick={() => setTheme("light")}>
          Light Theme
        </Button>
        <Button variant={theme === "dark" ? "default" : "outline"} onClick={() => setTheme("dark")}>
          Dark Theme
        </Button>
        <Button
          variant={theme === "nith-theme" ? "default" : "outline"}
          onClick={() => setTheme("nith-theme")}
          className="bg-[#660000] text-white hover:bg-[#990000] nith-theme:bg-primary nith-theme:hover:bg-tertiary"
        >
          IAOL Brand Theme
        </Button>
        <Button
          variant={theme === "system" ? "default" : "outline"}
          onClick={() => setTheme("system")}
          className="flex items-center gap-1"
        >
          <Monitor className="h-4 w-4" />
          System Theme
        </Button>
      </div>

      {theme === "nith-theme" && (
        <Card>
          <CardHeader>
            <CardTitle>IAOL Brand Theme Colors</CardTitle>
            <CardDescription>Custom theme colors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-md bg-primary"></div>
                <span className="text-xs mt-1">Primary</span>
                <span className="text-xs text-muted-foreground">#660000</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-md bg-secondary"></div>
                <span className="text-xs mt-1">Secondary</span>
                <span className="text-xs text-muted-foreground">#A52A2A</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-md bg-background"></div>
                <span className="text-xs mt-1">Background</span>
                <span className="text-xs text-muted-foreground">#FCF1B1</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-md bg-muted"></div>
                <span className="text-xs mt-1">Subtle Light</span>
                <span className="text-xs text-muted-foreground">#FAF0B3</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-md bg-tertiary"></div>
                <span className="text-xs mt-1">Tertiary</span>
                <span className="text-xs text-muted-foreground">#990000</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-md bg-gold"></div>
                <span className="text-xs mt-1">Gold</span>
                <span className="text-xs text-muted-foreground">#FFD700</span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">UI Elements Preview</h3>
              <div className="flex flex-wrap gap-2">
                <Button>Primary Button</Button>
                <Button variant="secondary">Secondary Button</Button>
                <Button variant="outline">Outline Button</Button>
                <Button variant="ghost">Ghost Button</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge>Primary Badge</Badge>
                <Badge variant="secondary">Secondary Badge</Badge>
                <Badge variant="outline">Outline Badge</Badge>
                <Badge variant="destructive">Destructive Badge</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

