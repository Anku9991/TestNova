import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
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

export async function registerWithEmail(
  email: string,
  password: string,
  name: string,
  role: UserRole = "student"
) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName: name });
  await createUserDocument(credential.user, { role, name });
  return credential.user;
}

export async function loginWithEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function loginWithGoogle() {
  const credential = await signInWithPopup(auth, googleProvider);
  const userDoc = await getDoc(doc(db, "users", credential.user.uid));
  if (!userDoc.exists()) {
    await createUserDocument(credential.user, { role: "student" });
  }
  return credential.user;
}

export async function logout() {
  await signOut(auth);
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}

export async function createUserDocument(
  user: User,
  extras: { role?: UserRole; name?: string }
) {
  await setDoc(
    doc(db, "users", user.uid),
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
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
}

export { onAuthStateChanged, auth };
