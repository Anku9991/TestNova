import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seed() {
  console.log("Seeding exams...");
  const examsCol = collection(db, "exams");
  
  await addDoc(examsCol, {
    title: "SSC CGL Tier-1 Full Mock #1",
    description: "Full length mock test for SSC CGL Tier 1.",
    category: "SSC CGL",
    duration: 60,
    totalQuestions: 100,
    totalMarks: 200,
    negativeMarking: 0.5,
    isPublished: true,
    isFree: true,
    isPremium: false,
    difficulty: "medium",
    instructions: "Standard SSC instructions.",
    tags: ["ssc", "cgl", "mock"],
    createdBy: "admin_seed",
    createdAt: new Date(),
    updatedAt: new Date(),
    attemptCount: 0
  });

  await addDoc(examsCol, {
    title: "Reasoning & GI Practice Set",
    description: "Practice set for Reasoning and General Intelligence.",
    category: "Reasoning",
    duration: 30,
    totalQuestions: 50,
    totalMarks: 50,
    negativeMarking: 0.25,
    isPublished: true,
    isFree: false,
    isPremium: true,
    difficulty: "hard",
    instructions: "Answer carefully.",
    tags: ["reasoning", "practice"],
    createdBy: "admin_seed",
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(Date.now() - 86400000),
    attemptCount: 0
  });

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch(console.error);
