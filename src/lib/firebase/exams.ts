import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy, where, serverTimestamp } from "firebase/firestore";
import { db } from "./config";
import { Exam } from "@/types";

const COLLECTION = "exams";

export const getExams = async (filters?: { category?: string }): Promise<Exam[]> => {
  let q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
  
  if (filters?.category && filters.category !== "all") {
    q = query(collection(db, COLLECTION), where("category", "==", filters.category), orderBy("createdAt", "desc"));
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      startDate: data.startDate?.toDate(),
      endDate: data.endDate?.toDate(),
    } as Exam;
  });
};

export const getExam = async (id: string): Promise<Exam | null> => {
  const docRef = doc(db, COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    startDate: data.startDate?.toDate(),
    endDate: data.endDate?.toDate(),
  } as Exam;
};

export const createExam = async (examData: Omit<Exam, "id" | "createdAt" | "updatedAt">): Promise<string> => {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...examData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateExam = async (id: string, examData: Partial<Omit<Exam, "id" | "createdAt" | "updatedAt">>): Promise<void> => {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    ...examData,
    updatedAt: serverTimestamp(),
  });
};

export const deleteExam = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTION, id);
  await deleteDoc(docRef);
};
