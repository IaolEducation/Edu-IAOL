/**
 * Upload a file via the app's API (Vercel Blob). Use this instead of Firebase Storage
 * when Storage is not enabled (e.g. on the free Spark plan).
 */
export async function uploadFile(file: File, pathPrefix: string): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("path", pathPrefix)

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `Upload failed (${res.status})`)
  }

  const data = await res.json()
  if (!data.url || typeof data.url !== "string") {
    throw new Error("Invalid upload response")
  }
  return data.url
}
