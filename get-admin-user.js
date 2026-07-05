const admin = require("firebase-admin");

// Initialize with default credentials / ADC
try {
  admin.initializeApp();
} catch (e) {
  console.error("Default init failed, trying emulator / fallback", e);
}

const db = admin.firestore();

async function run() {
  const snap = await db.collection("users").get();
  console.log("Users in database:");
  snap.forEach(doc => {
    const data = doc.data();
    console.log(`- ID: ${doc.id}, Email: ${data.email}, Role: ${data.role}`);
  });
}

run().catch(console.error);
