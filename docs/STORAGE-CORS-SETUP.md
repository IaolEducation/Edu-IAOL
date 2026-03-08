# Firebase Storage CORS (only if you use Firebase Storage)

**Note:** This app uses **Vercel Blob** for file uploads (chat images, resources) by default, so you do **not** need Firebase Storage or this CORS setup. Add `BLOB_READ_WRITE_TOKEN` in Vercel (or `.env.local`) and you're set. See [Vercel Blob](https://vercel.com/docs/storage/vercel-blob).

---

If you later switch to Firebase Storage, the browser error **"blocked by CORS policy: Response to preflight request doesn't pass access control check"** happens when the **Firebase Storage bucket** has no CORS configuration. Below is how to fix it.

## One-time fix: set CORS on your bucket

### 1. Get your bucket name

- Firebase Console → **Storage** → tab **Files**  
- At the top you’ll see the bucket name, e.g. `iaol-website-2026.appspot.com`  
  (or in **Project settings** → **General** → **Your apps** → **Storage bucket**)

### 2. Use Google Cloud Shell (easiest, no local install)

1. Open [Google Cloud Console](https://console.cloud.google.com/) and select the project **iaol-website-2026**.
2. Click the **Activate Cloud Shell** icon (terminal `>_`) in the top bar.
3. In Cloud Shell, create the CORS config (copy-paste the whole block):

```bash
cat > cors.json << 'EOF'
[
  {
    "origin": [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://iaol-website-2026.vercel.app",
      "https://*.vercel.app"
    ],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE", "OPTIONS"],
    "responseHeader": [
      "Content-Type",
      "Content-Length",
      "Authorization",
      "x-goog-resumable",
      "x-goog-meta-*"
    ],
    "maxAgeSeconds": 3600
  }
]
EOF
```

4. Apply CORS to your bucket (replace `YOUR_BUCKET_NAME` with the bucket from step 1, e.g. `iaol-website-2026.appspot.com`):

```bash
gsutil cors set cors.json gs://YOUR_BUCKET_NAME
```

5. Confirm:

```bash
gsutil cors get gs://YOUR_BUCKET_NAME
```

You should see the same JSON. After that, uploads from localhost and your deployed app should work.

### 3. Optional: use the project’s `storage-cors.json`

From the project root you can upload the existing config:

```bash
gsutil cors set storage-cors.json gs://YOUR_BUCKET_NAME
```

(Requires [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) and `gcloud auth login` + `gsutil` on your machine.)

## Also check Storage security rules

In **Firebase Console → Storage → Rules**, you must allow writes to the paths your app uses, for example:

- `chat-files/{chatId}/*` – for chat file uploads
- `resources/{userId}/*` – for resource uploads

If CORS is set but rules deny the request, you’ll get 403 (which can still show up as a CORS error in the browser). So both CORS and Storage rules must be correct.
