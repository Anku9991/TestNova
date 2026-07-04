import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy, where, serverTimestamp } from "firebase/firestore";
import { db } from "./config";
import { Question } from "@/types";

const COLLECTION = "questions";

export const getQuestions = async (filters?: { topicId?: string; difficulty?: string; type?: string }): Promise<Question[]> => {
  const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
  
  // Note: Firestore requires composite indexes for multiple where clauses + orderBy.
  // We'll fetch all ordered by createdAt and filter client-side for simplicity in this demo,
  // or apply single where clause if needed. For a production app with large data,
  // we would create composite indexes in Firebase Console.
  
  const snapshot = await getDocs(q);
  let questions = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
    } as Question;
  });

  if (filters) {
    if (filters.topicId && filters.topicId !== "all") {
      questions = questions.filter(q => q.topicId === filters.topicId);
    }
    if (filters.difficulty && filters.difficulty !== "all") {
      questions = questions.filter(q => q.difficulty === filters.difficulty);
    }
    if (filters.type && filters.type !== "all") {
      questions = questions.filter(q => q.type === filters.type);
    }
  }

  return questions;
};

export const getQuestion = async (id: string): Promise<Question | null> => {
  const docRef = doc(db, COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
  } as Question;
};

export const createQuestion = async (questionData: Omit<Question, "id" | "createdAt">): Promise<string> => {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...questionData,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateQuestion = async (id: string, questionData: Partial<Omit<Question, "id" | "createdAt">>): Promise<void> => {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    ...questionData,
  });
};

export const deleteQuestion = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTION, id);
  await deleteDoc(docRef);
};
