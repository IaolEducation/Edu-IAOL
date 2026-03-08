# IAOLEducation – Setup Guide

This guide covers Firebase, Google OAuth, and environment variables for the IAOLEducation project.

---

## 1. Firebase setup

### 1.1 Create a Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** (or use an existing project).
3. Follow the steps (Google Analytics optional).

### 1.2 Register your app

1. In the project overview, click the **Web** icon (`</>`).
2. Enter an app nickname (e.g. "IAOLEducation Web").
3. Copy the `firebaseConfig` object (you will use these values in `.env.local`).

### 1.3 Enable Authentication

1. In the left sidebar, go to **Build → Authentication**.
2. Click **Get started**.
3. Open the **Sign-in method** tab.
4. Enable:
   - **Email/Password** (for student and admin login).
   - **Google** (for “Sign in with Google”).

### 1.4 Create Firestore database

1. Go to **Build → Firestore Database**.
2. Click **Create database**.
3. Choose **Start in production mode** (you can add rules later).
4. Pick a region and confirm.

Recommended collections (created by the app when used):

- `users` – user profiles and `role` (`student` | `admin`).
- `admins` – admin users (doc ID = Firebase Auth UID); used for admin login.
- `experiences` – placement experiences.
- `companies` – company data.

### 1.5 (Optional) Storage

1. Go to **Build → Storage**.
2. Click **Get started** and accept defaults if you use file uploads.

### 1.6 Environment variables for Firebase

In `.env.local` (see `.env.example`), set:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-...
```

All of these come from the Firebase Console → Project settings → Your apps → SDK setup and configuration.

---

## 2. Google OAuth (Sign in with Google)

### 2.1 Enable Google in Firebase

1. **Authentication → Sign-in method**.
2. Click **Google**.
3. Turn **Enable** on.
4. Set **Project support email**.
5. Click **Save**.

Firebase will use a default OAuth client for the Web. For production you can use your own OAuth client (see below).

### 2.2 (Optional) Use your own OAuth client

1. Open [Google Cloud Console](https://console.cloud.google.com/) and select the same project as Firebase (or the one linked to it).
2. Go to **APIs & Services → Credentials**.
3. Click **Create credentials → OAuth client ID**.
4. Application type: **Web application**.
5. Add **Authorized JavaScript origins**:
   - `http://localhost:3000` (development)
   - `https://yourdomain.com` (production)
6. Add **Authorized redirect URIs** (Firebase will show the correct one in Authentication → Google → Web SDK configuration):
   - Usually like: `https://your-project.firebaseapp.com/__/auth/handler`
7. Create and copy **Client ID** and **Client secret**.
8. In Firebase **Authentication → Sign-in method → Google**, paste the Web client ID and secret.

No extra environment variables are required in the app for Google sign-in; the Firebase config in `.env.local` is enough.

---

## 3. Environment variables summary

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_*` | Yes | Firebase Web config (see `.env.example`). |
| `NEXT_PUBLIC_OPENROUTER_API_KEY` | No | For chat/AI (OpenRouter). |
| `RESEND_API_KEY` | No | For contact form emails (Resend). |
| `ADMIN_EMAILS` | No | Comma-separated admin emails (future use). |

Copy `.env.example` to `.env.local`, then fill in the Firebase (and optional) values.

---

## 4. Admin access

- **Via Firestore:** Add a document in the `admins` collection with document ID = the user’s Firebase Auth **UID**, and fields such as `name`, `email`. That user can then sign in at **Admin login** (`/admin/login`) with the same email/password (or after signing in with Google, they will not be treated as admin unless they also have an `admins` entry – admin login flow uses email/password and checks `admins`).
- **Hardcoded list (optional):** You can later support an `ADMIN_EMAILS` env variable (e.g. in an API route that verifies the user’s token and checks their email). Currently, admin status is determined by the `admins` collection and/or `users/{uid}.role === "admin"` (set when an admin signs in via `/admin/login`).

---

## 5. Updating dependencies

The project uses Next.js 15, React 19, and Firebase. To update packages:

```bash
npm update
```

If you see peer dependency conflicts (e.g. with `date-fns` / `react-day-picker`), you can run:

```bash
npm update --legacy-peer-deps
```

---

## 6. Run the project

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The home page is public; other pages require sign-in. Use **Sign in** or **Sign in with Google**, or **Admin** for admin login (with an account that has an `admins` document).

---

## 7. Troubleshooting

- **Google sign-in popup blocked:** Allow popups for the site or use redirect flow.
- **CORS / redirect errors:** Ensure authorized origins and redirect URIs in Google Cloud and Firebase match your app URL (localhost and production).
- **“Invalid API key”:** Check that all `NEXT_PUBLIC_FIREBASE_*` values in `.env.local` match the Firebase Console and that you restarted the dev server after changing env.
