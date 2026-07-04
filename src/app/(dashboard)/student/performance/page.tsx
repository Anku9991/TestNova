"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, TrendingUp, Target, CheckCircle, XCircle,
  Loader2, Trophy, Calendar
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { useResults } from "@/hooks/useResults";
import Link from "next/link";

const PIE_COLORS = ["#10b981", "#ef4444", "#64748b"];

export default function PerformancePage() {
  const { user } = useAuth();
  const { results, loading } = useResults(user?.uid, 30);

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
    date: new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
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

      {/* Per-Test Bar Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card">
        <h2 className="font-display font-bold mb-4">Correct vs Wrong per Test</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
            <Bar dataKey="correct" name="Correct" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="wrong" name="Wrong" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
