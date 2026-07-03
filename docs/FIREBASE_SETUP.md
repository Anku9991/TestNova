# Firebase Setup Guide — TestNova

## Step 1: Create a New Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Add project"**
3. Project name: `TestNova-prod` (or your preferred name)
4. Enable Google Analytics: **Yes** (for Firebase Analytics)
5. Select/create a Google Analytics account
6. Click **"Create project"**

---

## Step 2: Register Web App

1. In your Firebase project, click the **Web icon** (`</>`)
2. App nickname: `TestNova Web`
3. Check **"Also set up Firebase Hosting"**
4. Click **"Register app"**
5. **Copy the Firebase config** — you'll need it for `.env.local`

---

## Step 3: Enable Authentication

1. Go to **Build → Authentication**
2. Click **"Get started"**
3. Enable the following sign-in methods:
   - **Email/Password** → Enable
   - **Google** → Enable → Add support email → Save
4. Under **Settings → Authorized domains**, add:
   - `localhost`
   - `your-vercel-domain.vercel.app`
   - `TestNova.com` (your custom domain)

---

## Step 4: Create Firestore Database

1. Go to **Build → Firestore Database**
2. Click **"Create database"**
3. Select **"Start in production mode"**
4. Choose region: **asia-south1 (Mumbai)** — for Indian users
5. Click **"Enable"**

### Deploy Security Rules

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize (in project root)
firebase init firestore

# Deploy rules and indexes
firebase deploy --only firestore
```

---

## Step 5: Create Firebase Storage

1. Go to **Build → Storage**
2. Click **"Get started"**
3. Select **"Start in production mode"**
4. Choose same region: **asia-south1**

### Deploy Storage Rules

```bash
firebase deploy --only storage
```

---

## Step 6: Enable Cloud Messaging (FCM) for Push Notifications

1. Go to **Build → Cloud Messaging**
2. Note your **Server Key** (for server-side push)
3. Get your **VAPID Key**:
   - Go to Project Settings → Cloud Messaging → Web Push certificates
   - Click **"Generate key pair"**
   - Copy the key — this is your `NEXT_PUBLIC_FIREBASE_VAPID_KEY`

---

## Step 7: Get Admin SDK Credentials

1. Go to **Project Settings → Service accounts**
2. Click **"Generate new private key"**
3. Download the JSON file
4. Extract these values for your `.env.local`:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY` (the long string — keep the newlines!)

---

## Step 8: Fill `.env.local`

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXX
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BNxxxxxxxx...

FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
```

---

## Step 9: Deploy Indexes

```bash
firebase deploy --only firestore:indexes
```

---

## Step 10: Seed Initial Data (Optional)

Create initial categories in Firestore manually or via a seed script:

**Collection:** `categories`

```json
{
  "name": "SSC Exams",
  "slug": "ssc",
  "icon": "building2",
  "color": "#3949ab",
  "description": "Staff Selection Commission exams",
  "examCount": 12,
  "isActive": true,
  "order": 1
}
```

Repeat for: railway, banking, upsc, defence, teaching, insurance, judiciary, engineering, medical, police.

---

## Firestore Composite Indexes

All indexes are defined in `firestore.indexes.json`. Deploy with:

```bash
firebase deploy --only firestore:indexes
```

---

## Security Checklist

- [ ] Firestore rules deployed
- [ ] Storage rules deployed
- [ ] Auth domains configured
- [ ] Analytics enabled
- [ ] Admin SDK key stored securely (never in client code)
- [ ] VAPID key for push notifications added
