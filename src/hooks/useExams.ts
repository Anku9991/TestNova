import { useState, useEffect } from "react";
import { collection, query, where, orderBy, limit, onSnapshot, QueryConstraint, getCountFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { Exam } from "@/types";

export function useExams(filters?: { isPublished?: boolean; isFree?: boolean; category?: string; limit?: number }) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!db) return;

    const q = collection(db, "exams");
    const constraints: QueryConstraint[] = [];

    if (filters?.isPublished !== undefined) {
      constraints.push(where("isPublished", "==", filters.isPublished));
    }
    if (filters?.isFree !== undefined) {
      constraints.push(where("isFree", "==", filters.isFree));
    }
    if (filters?.category) {
      constraints.push(where("category", "==", filters.category));
    }
    
    if (filters?.limit) {
      constraints.push(limit(filters.limit));
    }

    const finalQuery = query(q, ...constraints);

    const unsubscribe = onSnapshot(
      finalQuery,
      (snapshot) => {
        const examsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
          startDate: doc.data().startDate?.toDate(),
          endDate: doc.data().endDate?.toDate(),
        })) as Exam[];
        
        // Sort by creation date descending in memory to avoid composite index
        examsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        
        setExams(examsData);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching exams:", err);
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [filters?.isPublished, filters?.isFree, filters?.category, filters?.limit]);

  return { exams, loading, error };
}

export async function getExamsCount() {
  if (!db) return 0;
  const coll = collection(db, "exams");
  const snapshot = await getCountFromServer(coll);
  return snapshot.data().count;
}
