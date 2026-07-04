import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import * as fs from "fs";

// Manually parse .env.local
const env = {};
try {
  const envContent = fs.readFileSync(".env.local", "utf8");
  envContent.split("\n").forEach(line => {
    const parts = line.split("=");
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join("=").trim().replace(/^"|"$/g, "");
      env[key] = value;
    }
  });
} catch (err) {
  console.log("Could not read .env.local", err);
}

const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seed() {
  console.log("Seeding Academics (Courses, Subjects, Chapters, Topics)...");

  // 1. Seed Courses
  console.log("Seeding courses...");
  const coursesCol = collection(db, "courses");
  const course1Ref = await addDoc(coursesCol, {
    title: "SSC CGL Prep Masterclass",
    description: "Complete preparation for SSC CGL Tier 1 and 2.",
    code: "SSC-CGL",
    isPublished: true,
    level: "intermediate",
    language: "Hindi",
    tags: ["ssc", "cgl", "government"],
    price: 1999,
    offerPrice: 999,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const course2Ref = await addDoc(coursesCol, {
    title: "Banking & IBPS PO Special",
    description: "Comprehensive course for Bank PO and Clerk exams.",
    code: "BANK-PO",
    isPublished: true,
    level: "advanced",
    language: "English",
    tags: ["banking", "ibps", "po"],
    price: 2499,
    offerPrice: 1499,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // 2. Seed Subjects
  console.log("Seeding subjects...");
  const subjectsCol = collection(db, "subjects");
  const subQuantRef = await addDoc(subjectsCol, {
    courseId: course1Ref.id,
    title: "Quantitative Aptitude",
    description: "Maths and numerical ability.",
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const subEnglishRef = await addDoc(subjectsCol, {
    courseId: course1Ref.id,
    title: "English Language",
    description: "Grammar, comprehension and verbal skills.",
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const subBankingQuantRef = await addDoc(subjectsCol, {
    courseId: course2Ref.id,
    title: "Financial Math & DI",
    description: "Data Interpretation and banking math.",
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // 3. Seed Chapters
  console.log("Seeding chapters...");
  const chaptersCol = collection(db, "chapters");
  const chapNumSysRef = await addDoc(chaptersCol, {
    subjectId: subQuantRef.id,
    title: "Number System",
    description: "Integers, fractions, decimals, prime numbers.",
    sequence: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const chapPercentRef = await addDoc(chaptersCol, {
    subjectId: subQuantRef.id,
    title: "Percentage & Profit-Loss",
    description: "Calculations of percentages, markup, discount.",
    sequence: 2,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const chapReadingRef = await addDoc(chaptersCol, {
    subjectId: subEnglishRef.id,
    title: "Reading Comprehension",
    description: "Passage reading and analysis.",
    sequence: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // 4. Seed Topics
  console.log("Seeding topics...");
  const topicsCol = collection(db, "topics");
  const topicPrimeRef = await addDoc(topicsCol, {
    chapterId: chapNumSysRef.id,
    title: "Prime Numbers & Divisibility Rules",
    description: "Identifying primes and checking division.",
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const topicPercentCalcRef = await addDoc(topicsCol, {
    chapterId: chapPercentRef.id,
    title: "Percentage Calculations & Fractions",
    description: "Converting percentages to fractions and vice versa.",
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const topicVocabRef = await addDoc(topicsCol, {
    chapterId: chapReadingRef.id,
    title: "Vocabulary, Synonyms & Antonyms",
    description: "Word meanings and contextual usage.",
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // 5. Seed Questions (Question Bank)
  console.log("Seeding Question Bank...");
  const questionsCol = collection(db, "questions");
  await addDoc(questionsCol, {
    subjectId: subQuantRef.id,
    chapterId: chapNumSysRef.id,
    topicId: topicPrimeRef.id,
    type: "single",
    difficulty: "medium",
    text: "<p>Which of the following is the smallest prime number?</p>",
    options: [
      { id: "opt1", text: "1", isCorrect: false },
      { id: "opt2", text: "2", isCorrect: true },
      { id: "opt3", text: "3", isCorrect: false },
      { id: "opt4", text: "5", isCorrect: false }
    ],
    correctAnswer: "opt2",
    explanation: "<p>2 is the smallest prime number and the only even prime number.</p>",
    marks: 2,
    negativeMarks: 0.5,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  await addDoc(questionsCol, {
    subjectId: subQuantRef.id,
    chapterId: chapPercentRef.id,
    topicId: topicPercentCalcRef.id,
    type: "single",
    difficulty: "easy",
    text: "<p>If a value is increased by 20% and then decreased by 20%, what is the net change?</p>",
    options: [
      { id: "opt1", text: "No change", isCorrect: false },
      { id: "opt2", text: "4% increase", isCorrect: false },
      { id: "opt3", text: "4% decrease", isCorrect: true },
      { id: "opt4", text: "2% decrease", isCorrect: false }
    ],
    correctAnswer: "opt3",
    explanation: "<p>Net change = x + y + (xy/100) = 20 - 20 - (400/100) = -4%.</p>",
    marks: 2,
    negativeMarks: 0.5,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch(console.error);
