# Play Store Deployment — ExamNexa Android App

## Using Capacitor to Build Android App

### Prerequisites

- Android Studio installed
- JDK 17+
- Android SDK
- Node.js 20+

---

## Step 1: Install Capacitor

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init ExamNexa com.examnexa.app --web-dir=out
```

---

## Step 2: Configure capacitor.config.ts

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.examnexa.app',
  appName: 'ExamNexa',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    url: 'https://examnexa.com',   // Use live URL for production
    cleartext: false,
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0a0e27',
      androidSplashResourceName: 'splash',
    },
  },
};

export default config;
```

---

## Step 3: Build Next.js as Static Export

Update `next.config.ts`:
```typescript
const nextConfig = {
  output: 'export',  // Add this for Capacitor
  // ... rest of config
};
```

Then build:
```bash
npm run build
```

---

## Step 4: Add Android Platform

```bash
npx cap add android
npx cap sync android
```

---

## Step 5: Open in Android Studio

```bash
npx cap open android
```

---

## Step 6: App Icons

1. In Android Studio, right-click `res/` → New → Image Asset
2. Use ExamNexa logo as the source image
3. Generate all required sizes automatically

Or use a tool like [Makeappicon.com](https://makeappicon.com) to generate all sizes.

---

## Step 7: Splash Screen

1. Add splash image to `android/app/src/main/res/drawable/`
2. Configure in `capacitor.config.ts` (done above)

---

## Step 8: Signed Release Build

### Generate Keystore

```bash
keytool -genkey -v -keystore examnexa-release.jks \
  -alias examnexa -keyalg RSA -keysize 2048 -validity 10000
```

### Configure Signing in `android/app/build.gradle`

```gradle
android {
  signingConfigs {
    release {
      storeFile file('examnexa-release.jks')
      storePassword 'YOUR_STORE_PASSWORD'
      keyAlias 'examnexa'
      keyPassword 'YOUR_KEY_PASSWORD'
    }
  }
  buildTypes {
    release {
      signingConfig signingConfigs.release
      minifyEnabled true
      proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
  }
}
```

### Build Release APK/AAB

```bash
cd android
./gradlew bundleRelease    # Recommended: AAB for Play Store
./gradlew assembleRelease  # APK for direct distribution
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

---

## Step 9: Play Store Upload

1. Go to [Google Play Console](https://play.google.com/console)
2. Create new app: **ExamNexa**
3. App category: **Education**
4. Content rating: **Everyone**
5. Upload `app-release.aab`
6. Add screenshots (phone + tablet)
7. Write store listing description
8. Set pricing: **Free**
9. Submit for review (3-7 days)

---

## Play Store Requirements

### Screenshots Required
- 2-8 phone screenshots (1080x1920 min)
- 1-8 tablet screenshots (optional but recommended)
- Feature graphic: 1024x500

### Store Listing
- **Title**: ExamNexa — Govt Exam Prep
- **Short description**: SSC, Railway, Banking, UPSC & 200+ exam CBT practice
- **Full description**: See marketing copy in `docs/`

---

## Push Notifications with FCM

```bash
npm install @capacitor/push-notifications
npx cap sync android
```

Configure in `capacitor.config.ts` (already done above).

Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
<uses-permission android:name="android.permission.VIBRATE" />
```
