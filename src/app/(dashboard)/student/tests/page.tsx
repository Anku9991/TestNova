"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen, Search, Clock, Users, Lock, Zap, Filter,
  ChevronRight, Trophy, Star, CheckCircle
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useExams } from "@/hooks/useExams";

const CATEGORIES = ["All", "SSC", "Railway", "Banking", "UPSC", "Defence", "Teaching", "State PSC"];

export default function StudentTestsPage() {
  const { userProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showFreeOnly, setShowFreeOnly] = useState(false);

  const { exams, loading } = useExams({
    isPublished: true,
    ...(showFreeOnly ? { isFree: true } : {}),
  });

  const hasActiveSub = userProfile?.subscription?.status === "active";

  const filtered = exams.filter((exam) => {
    const matchSearch =
      exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = selectedCategory === "All" || exam.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "text-green-500 bg-green-500/10";
      case "medium": return "text-yellow-500 bg-yellow-500/10";
      case "hard": return "text-red-500 bg-red-500/10";
      default: return "text-purple-500 bg-purple-500/10";
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <BookOpen className="w-7 h-7 text-primary-500" />
          <h1 className="font-display text-2xl md:text-3xl font-bold">My Tests</h1>
        </div>
        <p className="text-muted-foreground">Browse all available exams and mock tests</p>
      </motion.div>

      {/* Subscription Banner for non-subscribers */}
      {!hasActiveSub && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-gradient-to-r from-primary-900/40 to-primary-800/20 border-primary-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <p className="font-semibold">Unlock All Premium Tests</p>
              <p className="text-sm text-muted-foreground">Get access to 500+ mock tests, live tests & PYPs</p>
            </div>
          </div>
          <Link href="/student/subscription" className="btn-primary whitespace-nowrap text-sm">
            Upgrade Now
          </Link>
        </motion.div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search exams, mock tests..."
            className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-primary-500/50 focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <label className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2.5 cursor-pointer whitespace-nowrap">
          <input
            type="checkbox"
            checked={showFreeOnly}
            onChange={(e) => setShowFreeOnly(e.target.checked)}
            className="w-4 h-4 rounded text-primary-500"
          />
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Free Only</span>
        </label>
      </div>

      {/* Category Filter Pills */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              selectedCategory === cat
                ? "bg-primary-500 text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Exam Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse h-56 bg-muted/50" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-muted-foreground">No exams found matching your criteria</p>
          <button onClick={() => { setSearchQuery(""); setSelectedCategory("All"); setShowFreeOnly(false); }}
            className="mt-3 text-primary-500 text-sm hover:underline">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((exam, i) => {
            const canAccess = exam.isFree || hasActiveSub;
            return (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="card flex flex-col hover:border-primary-500/40 transition-all group"
              >
                {/* Badges */}
                <div className="flex items-center justify-between mb-3">
                  <span className="badge-primary text-xs">{exam.category}</span>
                  <div className="flex gap-1.5">
                    {exam.isFree ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500">FREE</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 flex items-center gap-1">
                        <Star className="w-3 h-3" /> PREMIUM
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getDifficultyColor(exam.difficulty)}`}>
                      {exam.difficulty}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-bold text-base leading-snug mb-3 flex-1">{exam.title}</h3>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{exam.totalQuestions} Qs</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{exam.duration} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{exam.totalMarks} marks</span>
                  </div>
                </div>

                {/* Action */}
                {canAccess ? (
                  <Link
                    href={`/cbt/${exam.id}`}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-400 text-white font-semibold text-sm transition-all group-hover:shadow-glow"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Start Test
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <Link
                    href="/student/subscription"
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-muted text-muted-foreground font-semibold text-sm hover:bg-amber-500/10 hover:text-amber-500 transition-all"
                  >
                    <Lock className="w-4 h-4" />
                    Upgrade to Unlock
                  </Link>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Attempt count display */}
      {!loading && filtered.length > 0 && (
        <p className="text-center text-sm text-muted-foreground">
          Showing {filtered.length} of {exams.length} tests
        </p>
      )}
    </div>
  );
}
