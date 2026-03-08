import type { Metadata } from "next"
import { ThemeShowcase } from "@/components/theme-showcase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Theme Settings | NIT Hamirpur",
  description: "Customize the appearance of the NIT Hamirpur Placement Portal",
}

export default function ThemeSettingsPage() {
  return (
    <div className="container px-4 md:px-6 py-8 md:py-12">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Theme Settings</h1>
          <p className="text-muted-foreground">Customize the appearance of the NIT Hamirpur Placement Portal</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Choose Theme</CardTitle>
            <CardDescription>Select a theme that suits your preference</CardDescription>
          </CardHeader>
          <CardContent>
            <ThemeShowcase />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About NIT Hamirpur Theme</CardTitle>
            <CardDescription>A custom theme with NIT Hamirpur colors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The NIT Hamirpur theme features the official colors of the National Institute of Technology, Hamirpur.
              This theme includes:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Primary Color: Deep Maroon (#660000)</li>
              <li>Secondary Color: Brown/Brick Red (#A52A2A)</li>
              <li>Background: Light Yellow (#FCF1B1)</li>
              <li>Subtle Light Background: Cream (#FAF0B3)</li>
              <li>Tertiary Colors: Dark Red (#990000) and Gold (#FFD700)</li>
            </ul>
            <p>
              This theme represents the spirit and identity of NIT Hamirpur while providing a comfortable reading
              experience.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

