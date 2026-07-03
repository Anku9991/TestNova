# Vercel Deployment Guide — TestNova

## Prerequisites

- GitHub repository: [https://github.com/Anku9991/TestNova](https://github.com/Anku9991/TestNova)
- Vercel account linked to GitHub
- Firebase project configured

---

## Step 1: Connect GitHub to Vercel

1. Go to [vercel.com](https://vercel.com) → Your dashboard
2. Click **"Add New Project"**
3. Import from GitHub: select **Anku9991/TestNova**
4. Framework: **Next.js** (auto-detected)
5. Root directory: `./` (default)

---

## Step 2: Configure Build Settings

| Setting | Value |
|---|---|
| Framework Preset | Next.js |
| Build Command | `npm run build` |
| Output Directory | `.next` |
| Install Command | `npm install --legacy-peer-deps` |
| Node.js Version | 20.x |

---

## Step 3: Add Environment Variables

In Vercel dashboard → Project Settings → Environment Variables, add **all** variables from `.env.example`:

### Firebase (Client)
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
NEXT_PUBLIC_FIREBASE_VAPID_KEY
```

### Firebase Admin (Server-only)
```
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
```
> ⚠️ For `FIREBASE_PRIVATE_KEY`, paste the entire key including `-----BEGIN PRIVATE KEY-----` and newlines.

### Razorpay
```
NEXT_PUBLIC_RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
```

### App Config
```
NEXT_PUBLIC_APP_NAME=TestNova
NEXT_PUBLIC_APP_URL=https://your-vercel-url.vercel.app
```

---

## Step 4: Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (~3-5 minutes)
3. Your app is live at `https://testnova-xxxx.vercel.app`

---

## Step 5: Custom Domain Setup

1. Go to Project Settings → Domains
2. Add your custom domain: `TestNova.com`
3. Vercel provides SSL automatically
4. Update DNS records at your domain registrar:
   - Type: `CNAME`, Name: `www`, Value: `cname.vercel-dns.com`
   - Type: `A`, Name: `@`, Value: `76.76.21.21`
5. Update `NEXT_PUBLIC_APP_URL` to your custom domain

---

## Step 6: Automatic Deployments

Vercel automatically redeploys on every push to `main` branch.

```bash
# Push to trigger deployment
git add .
git commit -m "feat: update landing page"
git push origin main
```

For preview deployments, push to any other branch.

---

## Step 7: Configure Firebase Auth Domain

After adding your custom domain, add it to Firebase Auth:

1. Firebase Console → Authentication → Settings → Authorized domains
2. Add: `TestNova.com` and `www.TestNova.com`

---

## Performance Optimizations

Vercel automatically provides:
- ✅ Edge CDN (200+ locations globally)
- ✅ Automatic HTTPS
- ✅ Image optimization via `next/image`
- ✅ Incremental Static Regeneration
- ✅ Edge Functions for API routes

---

## Monitoring

1. **Vercel Analytics**: Enable in Project Settings → Analytics
2. **Speed Insights**: Enable in Project Settings → Speed Insights
3. **Firebase Analytics**: Automatically tracks if `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` is set

---

## Git Commands Reference

```bash
# Initial setup
git init
git remote add origin https://github.com/Anku9991/TestNova.git
git branch -M main

# First push
git add .
git commit -m "feat: initial TestNova production build"
git push -u origin main

# Regular updates
git add .
git commit -m "fix: CBT timer issue"
git push origin main

# Create feature branch
git checkout -b feature/payment-integration
git push origin feature/payment-integration

# Merge PR
git checkout main
git merge feature/payment-integration
git push origin main
```

---

## Production Deployment Checklist

- [ ] All environment variables added to Vercel
- [ ] Firebase Auth domains updated
- [ ] Firestore rules deployed
- [ ] Storage rules deployed
- [ ] Firestore indexes deployed
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Analytics tracking verified
- [ ] Razorpay webhook URL updated
- [ ] Error monitoring (Sentry) configured
- [ ] Performance score checked (Lighthouse 95+)
