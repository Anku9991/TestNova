const fs = require('fs');

// 1. Read .env.local
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
const { getAuth, createUserWithEmailAndPassword } = require("firebase/auth");
const { getFirestore, doc, setDoc } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log("Using Config Project ID:", firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function run() {
  const email = "admin@testnova.in";
  const password = "AdminPassword123#";
  console.log(`Registering user ${email}...`);
  
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const user = cred.user;
    console.log(`Registered auth user with UID: ${user.uid}`);
    
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: email,
      name: "TestNova Super Admin",
      role: "superadmin",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log("Super Admin profile document successfully created in Firestore!");
  } catch (err) {
    console.error("Error creating Super Admin:", err);
  }
}

run().catch(console.error);
