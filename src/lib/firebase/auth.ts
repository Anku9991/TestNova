import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./config";
import type { UserRole } from "@/types";

const googleProvider = new GoogleAuthProvider();

function requireAuth() {
  if (!auth) throw new Error("Firebase not initialized — check environment variables.");
  return auth;
}
function requireDb() {
  if (!db) throw new Error("Firebase not initialized — check environment variables.");
  return db;
}


export async function registerWithEmail(
  email: string,
  password: string,
  name: string,
  role: UserRole = "student"
) {
  const credential = await createUserWithEmailAndPassword(requireAuth(), email, password);
  await updateProfile(credential.user, { displayName: name });
  await createUserDocument(credential.user, { role, name });
  return credential.user;
}

export async function loginWithEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(requireAuth(), email, password);
  return credential.user;
}

export async function loginWithGoogle() {
  await signInWithRedirect(requireAuth(), googleProvider);
}

export async function handleGoogleRedirect() {
  const credential = await getRedirectResult(requireAuth());
  if (credential) {
    const userDoc = await getDoc(doc(requireDb(), "users", credential.user.uid));
    if (!userDoc.exists()) {
      await createUserDocument(credential.user, { role: "student" });
    }
    return credential.user;
  }
  return null;
}

export async function logout() {
  await signOut(requireAuth());
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(requireAuth(), email);
}

export async function createUserDocument(
  user: User,
  extras: { role?: UserRole; name?: string }
) {
  await setDoc(
    doc(requireDb(), "users", user.uid),
    {
      uid: user.uid,
      email: user.email,
      name: extras.name || user.displayName || "",
      photoURL: user.photoURL || "",
      role: extras.role || "student",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true,
      subscription: null,
    },
    { merge: true }
  );
}

export async function getUserDocument(uid: string) {
  const docRef = doc(requireDb(), "users", uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
}

export { onAuthStateChanged, auth };
