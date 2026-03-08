# Firebase Quick Start – What to Do With the Console Snippet

You see something like this in Firebase Console (npm + config). **Do not paste the config into your code.** Put it in env and run the app.

---

## Step 1: Install Firebase (if needed)

You already have Firebase in the project. If you started from scratch:

```bash
npm install firebase
```

---

## Step 2: Put the config in `.env.local` (never in code)

1. In your **project root** (same folder as `package.json`), create or edit **`.env.local`**.
2. **Do not** add `initializeApp` or the config object inside your source code. The app already reads config from env in `lib/firebase.ts`.
3. Copy the **values** from the Firebase Console into `.env.local` like this (use your own values from the snippet):

```env
# --- Firebase (from Firebase Console: Project settings → Your apps → Config) ---
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDOkb1cRdfMaj_J5IuIjnszZwmfiDGrbwc
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=iaol-website-2026.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=iaol-website-2026
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=iaol-website-2026.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=636134619673
NEXT_PUBLIC_FIREBASE_APP_ID=1:636134619673:web:0394941bae1e299fe10888
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-58F4L91M1J
```

4. Save `.env.local`.  
5. **Do not commit this file** (it is in `.gitignore`). For team or deployment, use a template like `.env.example` without real keys.

---

## Step 3: Enable Google Sign-In in Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/) → your project **iaol-website-2026**.
2. **Build** → **Authentication** → **Get started** (if first time).
3. **Sign-in method** tab → **Google** → **Enable** → set Project support email → **Save**.

---

## Step 4: Create Firestore

1. **Build** → **Firestore Database** → **Create database**.
2. Start in **production mode** (you can edit rules later).
3. Choose a region → **Enable**.

---

## Step 5: Run the app

```bash
npm run dev
```

Open http://localhost:3000 → **Sign in** → **Continue with Google**. You should be able to sign in and see onboarding/dashboard.

---

## Why not use the `<script>` tag or paste config in code?

- This is a **Next.js** app with a module bundler. We use `npm install firebase` and import from `"firebase/app"`, `"firebase/auth"`, etc. in `lib/firebase.ts`.
- Config is in **env** so:
  - Secrets and project IDs are not in git.
  - You can use different Firebase projects for dev/staging/prod by changing `.env.local` or deployment env vars.
- The app already has `initializeApp(firebaseConfig)` in `lib/firebase.ts`; the config object is built from `process.env.NEXT_PUBLIC_FIREBASE_*`. No need to add a second init or paste the snippet into a component.

---

## Optional: Analytics

The Console snippet includes `getAnalytics(app)`. This project does not call it by default (to avoid SSR issues). If you want Analytics later, add it in `lib/firebase.ts` only when running in the browser and use the optional `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` in the config.

---

## Reference: project rule

See **`.cursor/rules/iaol-firebase-env.mdc`** for the project rule: Firebase and env must stay in one place, config from env only, and how to add or change Firebase features correctly.
