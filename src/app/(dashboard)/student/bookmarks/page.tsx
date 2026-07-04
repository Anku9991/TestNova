"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bookmark, Loader2, Trash2, BookOpen, ExternalLink } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase/config";
import {
  collection, query, where, orderBy, onSnapshot,
  deleteDoc, doc
} from "firebase/firestore";
import { toast } from "sonner";
import Link from "next/link";

interface BookmarkItem {
  id: string;
  questionId: string;
  questionText: string;
  examId?: string;
  examTitle?: string;
  difficulty?: string;
  createdAt: any;
}

export default function BookmarksPage() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !db) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "bookmarks"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: BookmarkItem[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as BookmarkItem);
      });
      setBookmarks(items);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleRemove = async (bookmarkId: string) => {
    try {
      await deleteDoc(doc(db, "bookmarks", bookmarkId));
      toast.success("Bookmark removed");
    } catch (err) {
      toast.error("Failed to remove bookmark");
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "easy": return "text-green-500 bg-green-500/10";
      case "medium": return "text-yellow-500 bg-yellow-500/10";
      case "hard": return "text-red-500 bg-red-500/10";
      default: return "text-muted-foreground bg-muted";
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <Bookmark className="w-7 h-7 text-primary-500" />
          <h1 className="font-display text-2xl md:text-3xl font-bold">My Bookmarks</h1>
        </div>
        <p className="text-muted-foreground">Questions you&apos;ve saved for later review</p>
      </motion.div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="card text-center py-16">
          <Bookmark className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <h3 className="font-semibold mb-2">No bookmarks yet</h3>
          <p className="text-muted-foreground mb-4">
            Bookmark questions during your exam by clicking the 🔖 icon
          </p>
          <Link href="/student/tests" className="btn-primary inline-flex">
            <BookOpen className="w-4 h-4" />
            Browse Tests
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{bookmarks.length} saved question{bookmarks.length !== 1 ? "s" : ""}</p>
          {bookmarks.map((bookmark, i) => (
            <motion.div
              key={bookmark.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="card flex items-start gap-4 hover:border-primary-500/30 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bookmark className="w-5 h-5 text-primary-500" />
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className="text-sm leading-relaxed line-clamp-3"
                  dangerouslySetInnerHTML={{ __html: bookmark.questionText || "Question text not available" }}
                />
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {bookmark.difficulty && (
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${getDifficultyColor(bookmark.difficulty)}`}>
                      {bookmark.difficulty}
                    </span>
                  )}
                  {bookmark.examTitle && (
                    <span className="text-xs text-muted-foreground truncate">from: {bookmark.examTitle}</span>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">
                    {bookmark.createdAt?.toDate?.()
                      ? new Date(bookmark.createdAt.toDate()).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                      : ""}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                {bookmark.examId && (
                  <Link
                    href={`/cbt/${bookmark.examId}`}
                    className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-primary-500 transition-colors"
                    title="Go to Exam"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                )}
                <button
                  onClick={() => handleRemove(bookmark.id)}
                  className="p-2 rounded-xl hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                  title="Remove Bookmark"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
