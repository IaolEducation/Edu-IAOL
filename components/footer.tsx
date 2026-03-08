import Link from "next/link"
import Image from "next/image"
import { Mail } from "lucide-react"

export default function Footer() {
  return (
    <footer className="w-full border-t bg-muted/30 backdrop-blur-md">
      <div className="container flex flex-col gap-6 py-8 px-4 sm:px-6 md:flex-row md:items-start md:justify-between md:py-10">
        <div className="flex flex-col gap-2 text-center md:text-left">
          <Link href="/" className="inline-flex justify-center md:justify-start">
            <Image src="/eduiaol_name_transparent.png" alt="Eduiaol" width={120} height={34} className="h-8 w-auto object-contain" />
          </Link>
          <p className="text-sm text-muted-foreground">Affiliated with IAOL Education · Kargil, Ladakh</p>
          <p className="text-xs text-muted-foreground mt-1">Counselling thousands of JEE, NEET & other stream students.</p>
          <a href="mailto:iaoleducation65@gmail.com" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mt-2 justify-center md:justify-start">
            <Mail className="h-4 w-4 shrink-0" /> iaoleducation65@gmail.com
          </a>
        </div>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:justify-end md:gap-6">
          <Link href="/about" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">About</Link>
          <Link href="/contact" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Contact</Link>
          <Link href="/privacy" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Privacy</Link>
          <Link href="/team" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Team</Link>
        </div>
      </div>
      <div className="container border-t py-4 px-4 text-center">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Eduiaol. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

