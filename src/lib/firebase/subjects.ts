import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy, where, serverTimestamp } from "firebase/firestore";
import { db } from "./config";
import { Subject } from "@/types";

const COLLECTION = "subjects";

export const getSubjects = async (courseId?: string): Promise<Subject[]> => {
  let q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
  if (courseId) {
    q = query(collection(db, COLLECTION), where("courseId", "==", courseId), orderBy("createdAt", "desc"));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Subject;
  });
};

export const getSubject = async (id: string): Promise<Subject | null> => {
  const docRef = doc(db, COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  } as Subject;
};

export const createSubject = async (subjectData: Omit<Subject, "id" | "createdAt" | "updatedAt">): Promise<string> => {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...subjectData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateSubject = async (id: string, subjectData: Partial<Omit<Subject, "id" | "createdAt" | "updatedAt">>): Promise<void> => {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    ...subjectData,
    updatedAt: serverTimestamp(),
  });
};

export const deleteSubject = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTION, id);
  await deleteDoc(docRef);
};
