"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy, Clock, CheckCircle, XCircle, BarChart3,
  ArrowRight, Target, Loader2, Search
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useResults } from "@/hooks/useResults";

export default function ResultsListPage() {
  const { user } = useAuth();
  const { results, loading } = useResults(user?.uid, 50);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = results.filter((r: any) =>
    (r.examTitle || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getScoreColor = (pct: number) => {
    if (pct >= 75) return "text-green-500";
    if (pct >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBg = (pct: number) => {
    if (pct >= 75) return "bg-green-500/10 border-green-500/20";
    if (pct >= 50) return "bg-yellow-500/10 border-yellow-500/20";
    return "bg-red-500/10 border-red-500/20";
  };

  // Summary Stats
  const avgScore = results.length > 0
    ? results.reduce((acc: number, r: any) => acc + (r.percentage || 0), 0) / results.length
    : 0;
  const bestScore = results.length > 0
    ? Math.max(...results.map((r: any) => r.percentage || 0))
    : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <Trophy className="w-7 h-7 text-primary-500" />
          <h1 className="font-display text-2xl md:text-3xl font-bold">My Results</h1>
        </div>
        <p className="text-muted-foreground">Track your performance across all exams</p>
      </motion.div>

      {/* Summary Cards */}
      {!loading && results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Tests Attempted", value: results.length, icon: Target, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "Average Score", value: `${avgScore.toFixed(1)}%`, icon: BarChart3, color: "text-purple-500", bg: "bg-purple-500/10" },
            { label: "Best Score", value: `${bestScore.toFixed(1)}%`, icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-500/10" },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
                <div className="font-display text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by exam name..."
          className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-primary-500/50 focus:outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Results List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : results.length === 0 ? (
        <div className="card text-center py-16">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <h3 className="font-semibold mb-2">No results yet</h3>
          <p className="text-muted-foreground mb-4">Take your first test to see your results here</p>
          <Link href="/student/tests" className="btn-primary inline-flex">
            Browse Tests
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {(searchQuery ? filtered : results).map((result: any, i: number) => {
            const pct = result.percentage || 0;
            return (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`card flex items-center justify-between gap-4 border ${getScoreBg(pct)}`}
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{result.examTitle || "Exam"}</h3>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {result.timeTaken ? `${Math.floor(result.timeTaken / 60)}m ${result.timeTaken % 60}s` : "—"}
                    </span>
                    <span className="flex items-center gap-1 text-green-500">
                      <CheckCircle className="w-3.5 h-3.5" />
                      {result.correctAnswers ?? 0} correct
                    </span>
                    <span className="flex items-center gap-1 text-red-500">
                      <XCircle className="w-3.5 h-3.5" />
                      {result.incorrectAnswers ?? 0} wrong
                    </span>
                    <span>{new Date(result.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <div className={`font-display text-2xl font-bold ${getScoreColor(pct)}`}>{pct.toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground">{result.score ?? 0}/{result.totalMarks ?? 0} marks</div>
                  </div>
                  <Link
                    href={`/student/results/${result.id}`}
                    className="p-2 rounded-xl hover:bg-muted transition-colors group"
                  >
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary-500" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
