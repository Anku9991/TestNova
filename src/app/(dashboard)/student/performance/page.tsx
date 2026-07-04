"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, TrendingUp, Target, CheckCircle, XCircle,
  Loader2, Trophy, Calendar, ThumbsUp, ThumbsDown, BookOpen
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { useResults } from "@/hooks/useResults";
import Link from "next/link";
import { db } from "@/lib/firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";

const PIE_COLORS = ["#10b981", "#ef4444", "#64748b"];

export default function PerformancePage() {
  const { user } = useAuth();
  const { results, loading } = useResults(user?.uid, 30);
  const [topicChartData, setTopicChartData] = useState<any[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(false);

  useEffect(() => {
    async function fetchAndMapTopics() {
      if (!results || results.length === 0) return;
      setLoadingTopics(true);
      try {
        // Aggregate topic statistics
        const topicStats: Record<string, { total: number; correct: number; incorrect: number; skipped: number }> = {};
        
        results.forEach((r: any) => {
          if (Array.isArray(r.topicAnalysis)) {
            r.topicAnalysis.forEach((topic: any) => {
              const topicName = topic.topic || "General";
              if (!topicStats[topicName]) {
                topicStats[topicName] = { total: 0, correct: 0, incorrect: 0, skipped: 0 };
              }
              topicStats[topicName].total += (topic.totalQuestions || 0);
              topicStats[topicName].correct += (topic.correct || 0);
              topicStats[topicName].incorrect += (topic.incorrect || 0);
              topicStats[topicName].skipped += (topic.skipped || 0);
            });
          }
        });

        // Resolve names for Firestore topics (e.g. topic_123 -> Simplification)
        const mappedData = await Promise.all(
          Object.entries(topicStats).map(async ([name, data]) => {
            let displayName = name;
            
            // Try fetching topic document if it starts with a ID pattern
            if (name.length > 5 && db) {
              try {
                const topicSnap = await getDocs(query(collection(db, "topics"), where("title", "==", name)));
                if (!topicSnap.empty) {
                  displayName = topicSnap.docs[0].data().title;
                } else {
                  // Check if name is the doc ID itself
                  // In some implementations, q.topicId is the ID. We can lookup by ID
                  const docSnap = await getDocs(query(collection(db, "topics")));
                  const matchingDoc = docSnap.docs.find(d => d.id === name);
                  if (matchingDoc) displayName = matchingDoc.data().title;
                }
              } catch (e) {
                console.error("Failed lookup for topic:", name);
              }
            }

            const accuracy = data.total > 0 ? (data.correct / data.total) * 100 : 0;
            return {
              topic: displayName,
              accuracy: Math.round(accuracy),
              correct: data.correct,
              total: data.total
            };
          })
        );

        setTopicChartData(mappedData.sort((a, b) => b.accuracy - a.accuracy));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingTopics(false);
      }
    }
    fetchAndMapTopics();
  }, [results]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-24">
        <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-20" />
        <h2 className="font-display text-2xl font-bold mb-2">No Data Yet</h2>
        <p className="text-muted-foreground mb-6">Attempt at least one test to see your performance analytics</p>
        <Link href="/student/tests" className="btn-primary inline-flex">
          Browse Tests
        </Link>
      </div>
    );
  }

  // Chart data: last 10 results (oldest first) 
  const chartData = [...results].reverse().slice(0, 10).map((r: any, i) => ({
    test: `Test ${i + 1}`,
    score: Math.round(r.percentage || 0),
    correct: r.correctAnswers || 0,
    wrong: r.incorrectAnswers || 0,
    skipped: r.skippedAnswers || 0,
    date: r.createdAt?.seconds 
      ? new Date(r.createdAt.seconds * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) 
      : new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
  }));

  // Aggregate totals
  const totalCorrect = results.reduce((acc: number, r: any) => acc + (r.correctAnswers || 0), 0);
  const totalWrong = results.reduce((acc: number, r: any) => acc + (r.incorrectAnswers || 0), 0);
  const totalSkipped = results.reduce((acc: number, r: any) => acc + (r.skippedAnswers || 0), 0);
  const avgScore = results.reduce((acc: number, r: any) => acc + (r.percentage || 0), 0) / results.length;
  const bestScore = Math.max(...results.map((r: any) => r.percentage || 0));
  const improvementTrend = chartData.length >= 2
    ? chartData[chartData.length - 1].score - chartData[0].score
    : 0;

  const pieData = [
    { name: "Correct", value: totalCorrect },
    { name: "Wrong", value: totalWrong },
    { name: "Skipped", value: totalSkipped },
  ];

  // Strong / Weak Areas derivation
  const strongAreas = topicChartData.filter(t => t.accuracy >= 70);
  const weakAreas = topicChartData.filter(t => t.accuracy < 50);

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <BarChart3 className="w-7 h-7 text-primary-500" />
          <h1 className="font-display text-2xl md:text-3xl font-bold">Performance Analytics</h1>
        </div>
        <p className="text-muted-foreground">Your progress over the last {results.length} tests</p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Avg Score", value: `${avgScore.toFixed(1)}%`, icon: Target, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Best Score", value: `${bestScore.toFixed(1)}%`, icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-500/10" },
          { label: "Tests Taken", value: results.length, icon: Calendar, color: "text-purple-500", bg: "bg-purple-500/10" },
          {
            label: "Trend",
            value: `${improvementTrend >= 0 ? "+" : ""}${improvementTrend.toFixed(1)}%`,
            icon: TrendingUp,
            color: improvementTrend >= 0 ? "text-green-500" : "text-red-500",
            bg: improvementTrend >= 0 ? "bg-green-500/10" : "bg-red-500/10"
          },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card"
            >
              <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <div className="font-display text-2xl font-bold">{kpi.value}</div>
              <div className="text-sm text-muted-foreground">{kpi.label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card lg:col-span-2"
        >
          <h2 className="font-display font-bold mb-4">Score Trend (Last {chartData.length} Tests)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3949ab" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3949ab" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }}
                formatter={(v: number) => [`${v}%`, "Score"]}
              />
              <Area type="monotone" dataKey="score" stroke="#3949ab" strokeWidth={2.5} fill="url(#scoreGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Answer Distribution Pie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="card"
        >
          <h2 className="font-display font-bold mb-4">Answer Distribution</h2>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Legend formatter={(value) => <span style={{ fontSize: 12 }}>{value}</span>} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" />Correct</span>
              <span className="font-semibold">{totalCorrect}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2"><XCircle className="w-4 h-4 text-red-500" />Wrong</span>
              <span className="font-semibold">{totalWrong}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-slate-500 inline-block" />Skipped</span>
              <span className="font-semibold">{totalSkipped}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Advanced Topic Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Horizontal Topic Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.3 }} 
          className="card lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold">Accuracy by Topic & Subject</h2>
            {loadingTopics && <Loader2 className="w-4 h-4 animate-spin text-primary-500" />}
          </div>
          
          {topicChartData.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm border-2 border-dashed border-border rounded-xl">
              Take tests containing classified questions to see topic analytics.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topicChartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
                <YAxis dataKey="topic" type="category" tick={{ fontSize: 11 }} width={100} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} formatter={(v) => `${v}% Accuracy`} />
                <Bar dataKey="accuracy" fill="#3949ab" radius={[0, 4, 4, 0]}>
                  {topicChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.accuracy >= 70 ? "#10b981" : entry.accuracy < 50 ? "#ef4444" : "#3949ab"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Personalized Recommendations Panel */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.35 }} 
          className="card flex flex-col justify-between"
        >
          <div className="space-y-6">
            <h2 className="font-display font-bold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary-500" />
              Focus Areas
            </h2>

            {/* Strong Areas */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <ThumbsUp className="w-3.5 h-3.5 text-green-500" /> Strongest Topics (🎉 Keep it up)
              </h4>
              {strongAreas.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No topics above 70% accuracy yet.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {strongAreas.map(t => (
                    <span key={t.topic} className="text-xs px-2.5 py-1 rounded-lg bg-green-500/10 text-green-500 border border-green-500/20 font-medium">
                      {t.topic} ({t.accuracy}%)
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Weak Areas */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <ThumbsDown className="w-3.5 h-3.5 text-red-500" /> Needs Improvement (⚠️ Focus here)
              </h4>
              {weakAreas.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">Awesome! No topics below 50% accuracy.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {weakAreas.map(t => (
                    <span key={t.topic} className="text-xs px-2.5 py-1 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 font-medium">
                      {t.topic} ({t.accuracy}%)
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {weakAreas.length > 0 && (
            <div className="mt-6 p-3 rounded-xl bg-primary-500/5 border border-primary-500/10 text-xs text-muted-foreground leading-relaxed">
              💡 **Study Tip**: Spend your next session solving topic tests specifically in **{weakAreas[0].topic}** to boost your overall accuracy!
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
