# TestNova 🎓

> **India's #1 Premium Government Competitive Exam CBT SaaS Platform**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://typescriptlang.org)
[![Firebase](https://img.shields.io/badge/Firebase-11-orange?logo=firebase)](https://firebase.google.com)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-cyan?logo=tailwindcss)](https://tailwindcss.com)

---

## 📌 Overview

TestNova is a production-ready, scalable SaaS platform for government competitive exam preparation. It provides a real Computer Based Test (CBT) experience for SSC, Railway, Banking, UPSC, Defence, Teaching, and 200+ more government exams.

**Key Links:**
- 🌐 Production: [https://TestNova.com](https://TestNova.com)
- 📦 GitHub: [https://github.com/Anku9991/TestNova](https://github.com/Anku9991/TestNova)
- 🚀 Vercel: [https://vercel.com/ankush-s-projects-3d237917/test-nova](https://vercel.com/ankush-s-projects-3d237917/test-nova)
- 🔥 Firebase: [Firebase Console](https://console.firebase.google.com)

---

## 🚀 Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 15.3.3 | Framework |
| React | 19.0.0 | UI Library |
| TypeScript | 5.7.2 | Type Safety |
| TailwindCSS | 3.4.17 | Styling |
| Framer Motion | 11.x | Animations |
| Firebase | 11.x | Backend (Auth, DB, Storage) |
| Recharts | 2.14 | Analytics Charts |
| Sonner | 1.7 | Toast Notifications |
| Zod + RHF | Latest | Form Validation |
| KaTeX | 0.16 | LaTeX Math Rendering |

---

## 📁 Project Structure

```
TestNova/
├── src/
│   ├── app/
│   │   ├── (auth)/              # Login, Register, Forgot Password
│   │   ├── (dashboard)/         # Student, Admin, Super Admin dashboards
│   │   ├── (exam)/              # Full-screen CBT engine
│   │   ├── api/                 # API routes (Razorpay, AI, etc.)
│   │   ├── layout.tsx           # Root layout with SEO metadata
│   │   ├── page.tsx             # Landing page
│   │   └── globals.css          # Global styles
│   ├── components/
│   │   ├── landing/             # Hero, Nav, Pricing, FAQ, Footer, etc.
│   │   ├── dashboard/           # Sidebar, Stats, Charts
│   │   ├── cbt/                 # CBT Engine, Question Palette, Timer
│   │   ├── admin/               # Admin panel components
│   │   └── providers.tsx        # Theme + Auth + Toast providers
│   ├── hooks/
│   │   └── useAuth.tsx          # Firebase auth context
│   ├── lib/
│   │   ├── firebase/            # Firebase config, auth helpers
│   │   └── utils.ts             # Shared utilities
│   ├── middleware.ts             # Route protection
│   └── types/index.ts           # All TypeScript types
├── public/
│   ├── manifest.json            # PWA manifest
│   └── icons/                   # PWA icons
├── docs/                        # Setup guides
├── firestore.rules              # Firestore security rules
├── firestore.indexes.json       # Firestore composite indexes
├── storage.rules                # Firebase Storage rules
├── firebase.json                # Firebase project config
├── .env.example                 # Environment variables template
├── next.config.ts               # Next.js configuration
├── tailwind.config.ts           # TailwindCSS design tokens
└── tsconfig.json                # TypeScript config
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 20+
- npm or yarn
- Firebase account
- Git

### 1. Clone & Install

```bash
git clone https://github.com/Anku9991/TestNova.git
cd TestNova
npm install --legacy-peer-deps
```

### 2. Environment Setup

```bash
cp .env.example .env.local
# Fill in your Firebase credentials and other values
```

### 3. Firebase Setup

See [docs/FIREBASE_SETUP.md](docs/FIREBASE_SETUP.md) for complete Firebase configuration guide.

### 4. Run Development Server

```bash
npm run dev
# Open http://localhost:3000
```

### 5. Build for Production

```bash
npm run build
npm start
```

---

## 🔐 User Roles

| Role | Access |
|---|---|
| `super_admin` | Full platform access, revenue analytics, all settings |
| `admin` | Manage users, exams, questions, payments, reports |
| `teacher` | Create/edit questions and exams |
| `content_manager` | Manage questions and blog content |
| `student` | Take tests, view results, manage profile |

---

## 🎯 Key Features

### Landing Page
- Hero with animated exam categories
- Stats counter with count-up animation
- 12 exam category cards (SSC, Railway, Banking, UPSC, Defence, etc.)
- 12 feature showcase cards
- 3-tier pricing section (Free/Pro/Annual)
- Testimonials carousel
- FAQ accordion
- CTA section + footer

### CBT Engine
- Full-screen exam interface (mirrors real government CBT)
- Real-time countdown timer
- Question palette with color coding (Answered/Marked/Visited/Unvisited)
- Mark for Review functionality
- Clear Response
- Auto-save responses
- Tab-switch violation detection
- Submit confirmation modal with stats

### Authentication
- Email/password login & registration
- Google OAuth
- Form validation with Zod + React Hook Form
- Toast notifications for all states

### Student Dashboard
- Performance trend chart (Recharts)
- KPI cards (Tests attempted, Best score, Percentile, Streak)
- AI daily target card
- Upcoming tests list
- Recent results with rank

### Super Admin Dashboard
- Revenue analytics chart
- KPI cards (Revenue, Active users, Subscriptions, Daily attempts)
- Plan distribution pie chart
- Exam category bar chart
- Real-time activity feed

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

See [docs/VERCEL_DEPLOYMENT.md](docs/VERCEL_DEPLOYMENT.md) for complete guide.

### Firebase Hosting

```bash
npm run build
firebase deploy --only hosting
```

---

## 📱 PWA

TestNova is a Progressive Web App (PWA). Users can:
- Install it on Android/iOS home screen
- Study offline (service worker caches key assets)
- Receive push notifications for upcoming tests

---

## 🧪 Scripts

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run typecheck    # TypeScript type check
```

---

## 📚 Documentation

| File | Description |
|---|---|
| [docs/FIREBASE_SETUP.md](docs/FIREBASE_SETUP.md) | Complete Firebase project setup |
| [docs/VERCEL_DEPLOYMENT.md](docs/VERCEL_DEPLOYMENT.md) | Vercel deployment guide |
| [docs/PLAY_STORE.md](docs/PLAY_STORE.md) | Android app via Capacitor |
| [docs/ENVIRONMENT_VARIABLES.md](docs/ENVIRONMENT_VARIABLES.md) | All env variables explained |

---

## 🛡️ Security

- Role-based Firestore security rules
- Firebase Storage rules with file size limits
- Security headers (X-Frame-Options, XSS Protection, etc.)
- Input validation with Zod on all forms
- Protected routes via Next.js middleware

---

## 📄 License

This is proprietary software. All rights reserved.
Copyright © 2025 TestNova. Unauthorized copying, distribution, or use is strictly prohibited.

---

## 🤝 Support

- Email: support@TestNova.com
- Phone: +91 98765 43210
- Support Portal: [help.TestNova.com](https://help.TestNova.com)
