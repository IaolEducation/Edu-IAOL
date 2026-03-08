import { put } from "@vercel/blob"
import { NextResponse } from "next/server"

// Max body size for Vercel serverless is 4.5 MB; we enforce a bit less for safety
const MAX_FILE_SIZE = 4 * 1024 * 1024 // 4 MB

export async function POST(request: Request) {
  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) {
    return NextResponse.json(
      { error: "Upload not configured. Add BLOB_READ_WRITE_TOKEN in Vercel (or .env.local)." },
      { status: 503 }
    )
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const pathPrefix = (formData.get("path") as string) || "uploads"

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 4 MB." },
        { status: 400 }
      )
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
    const path = `${pathPrefix}/${Date.now()}_${safeName}`

    const blob = await put(path, file, {
      access: "public",
      token,
    })

    return NextResponse.json({ url: blob.url })
  } catch (e) {
    console.error("Upload error:", e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Upload failed" },
      { status: 500 }
    )
  }
}
