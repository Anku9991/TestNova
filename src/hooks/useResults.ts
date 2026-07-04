import { useState, useEffect } from "react";
import { collection, query, where, orderBy, limit, onSnapshot, QueryConstraint, getCountFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { Result } from "@/types";

export function useResults(userId?: string, limitCount?: number) {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!db || !userId) {
      setLoading(false);
      return;
    }

    const q = collection(db, "results");
    const constraints: QueryConstraint[] = [];

    constraints.push(where("userId", "==", userId));
    if (limitCount) {
      constraints.push(limit(limitCount));
    }

    const finalQuery = query(q, ...constraints);

    const unsubscribe = onSnapshot(
      finalQuery,
      (snapshot) => {
        const resultsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as Result[];
        
        resultsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        
        setResults(resultsData);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching results:", err);
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId, limitCount]);

  return { results, loading, error };
}
