# Firebase & Google OAuth – Setup from Scratch

This guide configures Firebase Authentication so the app works. **Google Sign-In is required.** Email/Password sign-in is optional (the app shows “Continue with Google” first and offers email as an optional alternative).

---

## Part 1: Create a Firebase project

1. Go to **[Firebase Console](https://console.firebase.google.com/)** and sign in with your Google account.
2. Click **“Add project”** (or **“Create a project”**).
3. Enter a **project name** (e.g. `IAOLEducation`).
4. (Optional) Enable Google Analytics and choose or create an Analytics account.
5. Click **“Create project”** and wait until it’s ready, then **“Continue”**.

---

## Part 2: Register your web app

1. On the project overview, click the **Web** icon (`</>`).
2. Enter an **App nickname** (e.g. `IAOLEducation Web`).
3. Do **not** check “Firebase Hosting” unless you plan to use it.
4. Click **“Register app”**.
5. You’ll see a `firebaseConfig` object. Copy it; you’ll paste these values into `.env.local` in the next section.
6. Click **“Continue”** through the rest of the steps (you can add the SDK scripts later; Next.js uses the npm package).

---

## Part 3: Add environment variables

1. In your project root, copy the example env file:
   ```bash
   cp .env.example .env.local
   ```
2. Open **`.env.local`** and fill in the Firebase config. From the Firebase Console **Project settings** (gear icon) → **Your apps** → your web app → **SDK setup and configuration** → **Config**:

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef...
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

3. Save the file. Restart the dev server after changing env vars (`npm run dev`).

---

## Part 4: Enable Google Sign-In (required)

1. In Firebase Console, go to **Build** → **Authentication**.
2. Click **“Get started”** (if first time).
3. Open the **“Sign-in method”** tab.
4. Click **“Google”**.
5. Turn **Enable** on.
6. Set **Project support email** (your email).
7. Click **“Save”**.

Firebase will use a default OAuth client. For local and most deployments this is enough; “Continue with Google” will work without extra configuration.

### (Optional) Use your own OAuth client

Use this if you need a custom OAuth client (e.g. for a custom domain or stricter settings).

1. Open **[Google Cloud Console](https://console.cloud.google.com/)**.
2. Select the **same project** that Firebase uses (top bar project selector).  
   If you don’t see it, link it: Firebase Console → Project settings → **Integrations** → **Google Cloud** (or create a default Google Cloud project).
3. Go to **APIs & Services** → **Credentials**.
4. Click **“Create credentials”** → **“OAuth client ID”**.
5. If asked, set the **OAuth consent screen** (User type: External, add app name and support email, save).
6. Application type: **Web application**.
7. **Name**: e.g. `IAOLEducation Web`.
8. **Authorized JavaScript origins**:
   - `http://localhost:3000`
   - Your production URL, e.g. `https://yourdomain.com`
9. **Authorized redirect URIs**:  
   Use the one Firebase shows: **Authentication** → **Sign-in method** → **Google** → **Web SDK configuration** → **Web client** → “Authorized redirect URI” (e.g. `https://your-project-id.firebaseapp.com/__/auth/handler`).  
   Add that exact URI.
10. Click **“Create”** and copy the **Client ID** and **Client secret**.
11. Back in Firebase: **Authentication** → **Sign-in method** → **Google** → paste **Web client ID** and **Client secret** → **Save**.

No extra env vars are needed for Google; the Firebase config in `.env.local` is enough.

---

## Part 5: (Optional) Enable Email/Password sign-in

If you want users to sign in with email and password as well (the app shows “Sign in with email instead” when you enable it):

1. **Authentication** → **Sign-in method**.
2. Click **“Email/Password”**.
3. Turn **Enable** on.
4. Click **“Save”**.

If you leave this disabled, only Google Sign-In will be available (recommended for simplicity).

---

## Part 6: Create Firestore (for users and data)

1. In Firebase Console, go to **Build** → **Firestore Database**.
2. Click **“Create database”**.
3. Choose **“Start in production mode”** (you can add rules later).
4. Pick a **location** and confirm.
5. (Optional) In **Rules**, you can later restrict read/write by `request.auth != null` and `request.auth.uid`; for initial testing, default rules are fine.

The app will create collections such as `users` and `admins` when users sign up and when admins are added.

---

## Part 7: Add an admin user (optional) (so “Admin” shows and works)

Admin access is determined by:

- A document in the **`admins`** collection with document ID = the user’s **Firebase UID**, or  
- `users/{uid}.role === "admin"` (e.g. set after admin login from `/admin/login`).

To add an admin from scratch:

1. **Create a normal user** in the app (Sign up with email/password, or Sign in with Google).
2. In Firebase Console → **Authentication** → **Users**, find that user and copy their **User UID**.
3. Go to **Firestore Database**.
4. Click **“Start collection”**.
5. Collection ID: **`admins`**.
6. Document ID: paste the **User UID** you copied.
7. Add a field (e.g. `name`, string, your name) and save.

That user can now:

- Use **Admin** in the header (and go to `/admin`).
- Or go to **/admin/login** and sign in with the same email/password; they’ll get admin access and the Admin link will appear.

---

## Part 8: Run and test

1. Install and run:
   ```bash
   npm install
   npm run dev
   ```
2. Open **http://localhost:3000** and click **Sign in**.
3. **Continue with Google** (primary). You’ll be signed in and then see onboarding (choose College Student, Student, or Professional) or your Dashboard.
4. **Email sign-in (optional):** If you enabled Email/Password in Part 5, click “Sign in with email instead” on the login page to use email/password.
5. If you added an admin document in `admins`, that user will see the **Admin** link in the header and can open **/admin**.

---

## Troubleshooting

| Issue | What to check |
|--------|----------------|
| “Invalid API key” or config errors | All `NEXT_PUBLIC_FIREBASE_*` in `.env.local` match Firebase Console; dev server restarted after changing env. |
| Google popup blocked | Allow popups for localhost/your site, or use redirect flow. |
| Google “redirect_uri_mismatch” | In Google Cloud Credentials, the redirect URI exactly matches the one shown in Firebase (Google sign-in method). |
| Admin link not showing | User has a document in `admins` with document ID = their Firebase UID, or they logged in via **/admin/login** and have `users/{uid}.role === "admin"`. |
| “Permission denied” in Firestore | Firestore rules allow read/write for authenticated users (or adjust rules for your security needs). |

For more on env vars and optional features (OpenRouter, Resend, etc.), see **docs/SETUP.md**.
