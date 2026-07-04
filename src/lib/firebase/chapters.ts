import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy, where, serverTimestamp } from "firebase/firestore";
import { db } from "./config";
import { Chapter } from "@/types";

const COLLECTION = "chapters";

export const getChapters = async (subjectId?: string): Promise<Chapter[]> => {
  let q = query(collection(db, COLLECTION), orderBy("sequence", "asc"));
  if (subjectId) {
    q = query(collection(db, COLLECTION), where("subjectId", "==", subjectId), orderBy("sequence", "asc"));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Chapter;
  });
};

export const getChapter = async (id: string): Promise<Chapter | null> => {
  const docRef = doc(db, COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  } as Chapter;
};

export const createChapter = async (chapterData: Omit<Chapter, "id" | "createdAt" | "updatedAt">): Promise<string> => {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...chapterData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateChapter = async (id: string, chapterData: Partial<Omit<Chapter, "id" | "createdAt" | "updatedAt">>): Promise<void> => {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    ...chapterData,
    updatedAt: serverTimestamp(),
  });
};

export const deleteChapter = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTION, id);
  await deleteDoc(docRef);
};
