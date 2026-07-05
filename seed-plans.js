const fs = require('fs');

// 1. Read env
const env = {};
try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join('=').trim().replace(/^"|"$/g, '');
      env[key] = value;
    }
  });
} catch (err) {
  console.log("Could not read .env.local", err);
}

// 2. Initialize Firebase Client SDK
const { initializeApp } = require("firebase/app");
const { getAuth, signInWithEmailAndPassword } = require("firebase/auth");
const { getFirestore, doc, setDoc } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function run() {
  console.log("Logging in as Super Admin...");
  const userCred = await signInWithEmailAndPassword(auth, "admin@testnova.in", "AdminPassword123#");
  console.log("Authenticated admin UID:", userCred.user.uid);
  
  console.log("Seeding subscription plans into firestore...");
  
  // Seed Pro Plan
  const proPlanId = "pro_monthly";
  await setDoc(doc(db, "plans", proPlanId), {
    name: "Pro Monthly",
    description: "Get full access to all Govt Exam Mock Tests for 1 month.",
    price: 199,
    originalPrice: 499,
    currency: "INR",
    duration: 30,
    features: [
      "Unlimited Mock Tests",
      "Detailed Solutions & Explanations",
      "AI Weakness Analysis",
      "Real-time Chat Support"
    ],
    isPopular: true,
    isActive: true,
    createdAt: new Date(),
  });
  console.log("Successfully seeded Pro Monthly plan!");

  // Seed Annual Plan
  const annualPlanId = "annual_gold";
  await setDoc(doc(db, "plans", annualPlanId), {
    name: "Annual Gold",
    description: "Complete coverage of all test series with unlimited access for 1 year.",
    price: 999,
    originalPrice: 2999,
    currency: "INR",
    duration: 365,
    features: [
      "Everything in Pro Plan",
      "Full 1-Year Access",
      "Premium CBT Interface Simulator",
      "Priority Direct Teacher Support"
    ],
    isPopular: false,
    isActive: true,
    createdAt: new Date(),
  });
  console.log("Successfully seeded Annual Gold plan!");
}

run().catch(console.error);
