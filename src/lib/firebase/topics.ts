import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy, where, serverTimestamp } from "firebase/firestore";
import { db } from "./config";
import { Topic } from "@/types";

const COLLECTION = "topics";

export const getTopics = async (chapterId?: string): Promise<Topic[]> => {
  let q = query(collection(db, COLLECTION), orderBy("createdAt", "asc"));
  if (chapterId) {
    q = query(collection(db, COLLECTION), where("chapterId", "==", chapterId), orderBy("createdAt", "asc"));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Topic;
  });
};

export const getTopic = async (id: string): Promise<Topic | null> => {
  const docRef = doc(db, COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  } as Topic;
};

export const createTopic = async (topicData: Omit<Topic, "id" | "createdAt" | "updatedAt">): Promise<string> => {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...topicData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateTopic = async (id: string, topicData: Partial<Omit<Topic, "id" | "createdAt" | "updatedAt">>): Promise<void> => {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    ...topicData,
    updatedAt: serverTimestamp(),
  });
};

export const deleteTopic = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTION, id);
  await deleteDoc(docRef);
};
