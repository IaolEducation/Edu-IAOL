<div align="center">
  <img src="public/eduiaol_logo_transparent.png" alt="Eduiaol Logo" width="80" />
  <h1>Eduiaol</h1>
  <p><strong>JEE · NEET · Placements · Career Guidance</strong></p>
  <p>Affiliated with <strong>IAOL Education</strong> · Kargil, Ladakh</p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Firebase-Firestore-orange?logo=firebase" alt="Firebase" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38BDF8?logo=tailwindcss" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/PWA-Enabled-5A0FC8?logo=pwa" alt="PWA" />
  </p>
</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Firebase Setup](#firebase-setup)
  - [Running Locally](#running-locally)
- [User Roles & Types](#user-roles--types)
- [Firestore Collections](#firestore-collections)
- [API Routes](#api-routes)
- [PWA Configuration](#pwa-configuration)
- [Deployment](#deployment)
- [Configuration Reference](#configuration-reference)
- [Contributing](#contributing)
- [Contact](#contact)

---

## Overview

**Eduiaol** is a full-stack educational and career guidance web platform built for students and professionals affiliated with IAOL Education in Kargil, Ladakh. It bridges the gap between aspirants and those who have already navigated JEE, NEET, placements, and other competitive paths — by letting real people share real experiences.

> **Mission:** Counsel thousands of JEE, NEET & other stream students by connecting them with verified placement experiences, AI-powered guidance, and a peer community.

---

## Features

| Feature | Description |
|---|---|
| **Experience Sharing** | Professionals submit detailed placement journeys — company, interview rounds, prep strategy, tips |
| **Experience Discovery** | Filter experiences by branch, company, stream, placement type, and year |
| **College Activities** | College students log projects, clubs, internships, hackathons, and achievements |
| **Company Directory** | Browse companies with placement stats and linked student experiences |
| **AI Chat Assistant** | OpenRouter-powered AI (Deepseek) for academic help, coding, career advice |
| **Private Messaging** | Real-time Firestore-backed chat between users with unread badge counts |
| **Advice Forum** | Community tips, short-form advice, and update posts |
| **Study Resources** | Shared resource library with bookmarking / saves |
| **Exam Streams** | Dedicated pages for JEE, NEET, and other competitive exams |
| **Resume Builder** | Built-in resume creation tool |
| **Admin Dashboard** | Experience approval workflow, user management, platform analytics |
| **Progressive Web App** | Installable on mobile; service worker for offline caching |
| **Dark / Light Mode** | System-aware theme with manual toggle |
| **Role-based Access** | Guest, Student (exam prep), College Student, Professional, Admin |

---

## Tech Stack

### Frontend
| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, RSC) |
| Language | TypeScript 5 |
| UI Library | Radix UI + shadcn/ui |
| Styling | Tailwind CSS 3.4 + tailwindcss-animate |
| Icons | Lucide React |
| Animations | Framer Motion 12 |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Code Highlighting | react-syntax-highlighter |

### Backend & Services
| Service | Purpose |
|---|---|
| Firebase Auth | Email/Password + Google OAuth |
| Firebase Firestore | Primary NoSQL real-time database |
| Firebase Storage | Profile & company image storage |
| Vercel Blob | File uploads (4 MB max) |
| OpenRouter | AI chat completions (Deepseek v3) |
| Resend / Nodemailer | Transactional email |
| Vercel | Hosting & deployment |

---

## Project Structure

```
.
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout — providers, PWA, chat
│   ├── page.tsx                # Home page (role-aware)
│   ├── manifest.ts             # PWA manifest
│   ├── globals.css
│   ├── api/
│   │   ├── chat/route.ts       # OpenRouter chat API
│   │   └── upload/route.ts     # Vercel Blob upload
│   ├── auth/
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── dashboard/              # Role-based dashboards
│   │   ├── student/
│   │   ├── college/
│   │   └── professional/
│   ├── experiences/            # Browse & view experiences
│   │   └── [id]/
│   ├── companies/              # Company directory
│   │   └── [id]/
│   ├── messages/               # Private messaging
│   │   └── [chatId]/
│   ├── community/              # Public profiles & social
│   │   └── [uid]/
│   ├── streams/                # JEE / NEET / Others
│   ├── submit/                 # Experience / notes submission
│   ├── admin/                  # Admin dashboard
│   ├── profile/                # Logged-in user profile
│   ├── settings/               # Profile & theme settings
│   ├── resources/
│   ├── advice/
│   ├── resume-builder/
│   ├── contact/
│   └── actions/
│       └── send-email.ts       # Server action
│
├── components/
│   ├── chat/                   # AI chat (chat.tsx, model-selector, code-block, ...)
│   ├── ui/                     # 53 shadcn/ui primitives
│   ├── header.tsx
│   ├── footer.tsx
│   ├── submission-form.tsx     # Multi-tab experience form
│   ├── experience-list.tsx
│   ├── experience-card.tsx
│   ├── company-list.tsx
│   ├── advice-section.tsx
│   ├── stats-section.tsx
│   ├── pwa-install-prompt.tsx  # First-visit install banner
│   ├── pwa-register.tsx
│   ├── app-shell.tsx
│   └── ...
│
├── contexts/
│   └── auth-context.tsx        # Firebase auth + user state
│
├── providers/
│   └── chat-provider.tsx       # AI chat state
│
├── hooks/
│   ├── use-mobile.tsx
│   ├── use-responsive.ts
│   └── use-toast.ts
│
├── lib/
│   ├── firebase-config.ts      # Firebase initialization (singleton)
│   ├── firebase.ts             # Auth / Firestore / Storage exports
│   ├── data-utils.ts           # Firestore query helpers
│   ├── admin-utils.ts          # Admin-only operations
│   ├── upload.ts               # File upload helpers
│   └── utils.ts                # General utilities (cn, etc.)
│
├── public/
│   ├── sw.js                   # Service worker
│   ├── site.webmanifest
│   ├── eduiaol_logo_transparent.png
│   ├── eduiaol_name_transparent.png
│   ├── icons/                  # PWA icons (192, 512, apple-touch)
│   └── companies/              # Company logos
│
├── firebase-rules.txt          # Firestore security rules
├── storage-cors.json           # Firebase Storage CORS
├── components.json             # shadcn/ui config
├── tailwind.config.ts
├── next.config.mjs
└── tsconfig.json
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **pnpm** (recommended) — `npm i -g pnpm`
- A **Firebase** project (free Spark plan works)
- A **Vercel** account (for deployment + Blob storage)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/iaol.git
cd iaol

# Install dependencies
pnpm install
```

### Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | ✅ | Firebase Web API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | ✅ | `<project>.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ✅ | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | ✅ | `<project>.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | ✅ | Firebase sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | ✅ | Firebase app ID |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | ⚪ | Google Analytics (optional) |
| `BLOB_READ_WRITE_TOKEN` | ⚪ | Vercel Blob — required for file uploads |
| `NEXT_PUBLIC_OPENROUTER_API_KEY` | ⚪ | OpenRouter — required for AI chat |
| `RESEND_API_KEY` | ⚪ | Resend — required for contact emails |

### Firebase Setup

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and create a project.

2. Enable the following services:
   - **Authentication** → Email/Password + Google sign-in
   - **Firestore Database** → Start in production mode
   - **Storage** → Default bucket

3. Deploy Firestore security rules from `firebase-rules.txt`:
   ```bash
   firebase deploy --only firestore:rules
   ```

4. Deploy Storage CORS policy from `storage-cors.json`:
   ```bash
   gsutil cors set storage-cors.json gs://<your-bucket>
   ```

5. (Optional) Create an `admins` collection in Firestore and add a document with `{ uid, email, name }` for your admin user. Hardcoded admin emails can also be set in `contexts/auth-context.tsx`.

### Running Locally

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
# Build for production
pnpm build

# Start production server
pnpm start

# Lint
pnpm lint
```

---

## User Roles & Types

The platform distinguishes between two dimensions — **role** (access level) and **userType** (profile type):

### Roles
| Role | Description |
|---|---|
| `student` | Default role for all registered users |
| `admin` | Full platform access — approve/reject content, manage users |

### User Types
| Type | Home Page | Profile Capabilities |
|---|---|---|
| `student` | Exam prep dashboard (JEE / NEET / Others) | Study resources, stream guides |
| `college_student` | College dashboard | Log activities (projects, clubs, internships, hackathons, achievements) |
| `professional` | Professional dashboard | Submit placement experiences, post advice |

User type is selected during onboarding and can be updated in Settings.

---

## Firestore Collections

### `users`
Stores all registered user profiles.

```typescript
{
  uid: string
  email: string
  displayName: string
  photoURL: string
  role: "student" | "admin"
  userType: "student" | "college_student" | "professional" | null
  bio: string
  phone: string
  username: string
  linkedin: string
  instagram: string
  facebook: string
  publicEmail: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### `experiences`
Placement experiences submitted by professionals. Status `approved` shown publicly.

```typescript
{
  uid: string                   // submitter's user ID
  studentName: string
  branch: string
  company: string
  companyType: string
  role: string
  placementType: string
  placementYear: string
  package: string
  preparationStrategy: string
  interviewProcess: string
  tips: string
  challenges: string
  resources: { title: string; url: string }[]
  profileImage: string
  companyLogo: string
  linkedIn: string
  github: string
  personalEmail: string
  status: "pending" | "approved" | "rejected"
  submittedAt: Timestamp
}
```

### `college_activities`
Activities logged by `college_student` users.

```typescript
{
  uid: string
  title: string
  activityType: "project" | "club" | "internship" | "hackathon" | "achievement" | "research" | "other"
  description: string
  skills: string
  year: string
  link: string                  // optional
  createdAt: Timestamp
}
```

### `advice`
Short-form advice posts from any authenticated user.

```typescript
{
  content: string
  authorId: string
  authorName: string
  rating: number
  createdAt: Timestamp
}
```

### `chats`
Private 1-on-1 conversations.

```typescript
{
  participants: string[]         // array of user UIDs
  unreadCounts: { [uid]: number }
  createdAt: Timestamp
  updatedAt: Timestamp

  // subcollection: messages
  messages/{msgId}: {
    senderId: string
    content: string
    fileUrl: string             // optional
    timestamp: Timestamp
  }
}
```

### `companies`
Company directory — managed by admins.

```typescript
{
  id: string
  name: string
  logo: string
  category: string
  studentsPlaced: number
  experiencesCount: number
}
```

### `saves`
Bookmarked resources per user.

```typescript
{
  userId: string
  resourceId: string
}
```

### `shared_resources`
Community-shared links and materials.

```typescript
{
  title: string
  url: string
  category: string
  authorId: string
  createdAt: Timestamp
}
```

### `follows`
Social follow graph.

```typescript
{
  followerId: string
  followingId: string
}
```

### `blocks`
User block list.

```typescript
{
  blockerId: string
  blockedUserId: string
}
```

### `admins`
Extra admin users beyond the hardcoded list.

```typescript
{
  uid: string
  email: string
  name: string
}
```

---

## API Routes

### `POST /api/chat`

Proxy to OpenRouter for AI chat completions.

**Request body:**
```json
{
  "messages": [
    { "role": "user", "content": "How do I prepare for JEE Maths?" }
  ],
  "model": "deepseek/deepseek-chat-v3-0324:free"
}
```

**Response:**
```json
{
  "content": "...",
  "model": "deepseek/deepseek-chat-v3-0324:free"
}
```

Falls back to free Deepseek model on 400/404 errors. Returns HTTP 500 with error details on failure.

---

### `POST /api/upload`

Upload a file to Vercel Blob.

**Request:** `multipart/form-data` with `file` field (max 4 MB).

**Response:**
```json
{
  "url": "https://...vercel-storage.com/filename.jpg"
}
```

Filenames are sanitized before storage. Requires `BLOB_READ_WRITE_TOKEN`.

---

## PWA Configuration

Eduiaol is a Progressive Web App installable on Android, iOS (via "Add to Home Screen"), and desktop.

**Manifest** (`/app/manifest.ts`):
```
Name:          Eduiaol – JEE, NEET & Career Guidance
Short name:    Eduiaol
Display:       standalone
Start URL:     /
Theme color:   #0f172a
Background:    #ffffff
Icons:         192×192, 512×512 (any + maskable)
Categories:    education, productivity
```

**Service worker** (`/public/sw.js`):
- Registered via `<PwaRegister />` component on app load
- Enables background caching and offline access

**Install prompt** (`/components/pwa-install-prompt.tsx`):
- Listens for browser `beforeinstallprompt` event
- Shows a slide-up card after 2.5 s on first visit
- Stores dismissal state in `localStorage` (`pwa-install-dismissed`)
- Skips if already running in standalone/installed mode

---

## Deployment

### Vercel (Recommended)

1. Push your repo to GitHub.
2. Import the project in [vercel.com/new](https://vercel.com/new).
3. Add all environment variables from [Environment Variables](#environment-variables) in the Vercel dashboard.
4. Deploy — Vercel auto-detects Next.js.

**Vercel Blob** (for file uploads):
- Enable Blob in the Vercel Storage tab.
- Copy the `BLOB_READ_WRITE_TOKEN` and add it to your environment variables.

### Self-hosted

```bash
pnpm build
pnpm start           # default port 3000
```

Use a reverse proxy (nginx / Caddy) and a process manager (PM2) for production.

---

## Configuration Reference

### `next.config.mjs`

```js
{
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  }
}
```

### `tailwind.config.ts`

- Dark mode: `class`-based
- Container max-width: `1400px`, centered with `2rem` padding
- Custom CSS variable-driven color tokens: `primary`, `secondary`, `destructive`, `muted`, `accent`, `success`, `gold`
- Custom animations: `accordion-down`, `accordion-up`, `chat-border-glow`
- Plugins: `tailwindcss-animate`, `@tailwindcss/typography`

### `components.json` (shadcn/ui)

```json
{
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": { "baseColor": "slate", "cssVariables": true },
  "aliases": { "components": "@/components", "utils": "@/lib/utils" }
}
```

### `tsconfig.json`

```json
{
  "target": "ES6",
  "strict": true,
  "moduleResolution": "bundler",
  "paths": { "@/*": ["./*"] }
}
```

---

## Contributing

This is a private platform for IAOL Education. If you are an internal contributor:

1. Clone the repo and install dependencies (`pnpm install`).
2. Create a feature branch: `git checkout -b feat/your-feature`.
3. Make your changes and ensure `pnpm lint` passes.
4. Open a pull request with a clear description of the change.

**Code conventions:**
- Use `"use client"` only when necessary (forms, hooks, interactive state)
- Prefer server components for data-fetching pages
- Validate all form inputs with Zod schemas
- All Firestore writes must respect security rules defined in `firebase-rules.txt`
- Keep components focused; extract to `components/` when reused in ≥ 2 places
- Use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`) — mobile-first

---

## Contact

**IAOL Education**
Kargil, Ladakh, India
📧 [iaoleducation65@gmail.com](mailto:iaoleducation65@gmail.com)

Platform: [Eduiaol](https://eduiaol.com) · Counselling thousands of JEE, NEET & other stream students.

---

<div align="center">
  <sub>Built with Next.js · Firebase · Tailwind CSS · Vercel</sub>
</div>
