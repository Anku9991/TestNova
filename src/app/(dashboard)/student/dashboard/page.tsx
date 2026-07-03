"use client";

export const dynamic = "force-dynamic";

import { motion } from "framer-motion";
import {
  BookOpen, Trophy, BarChart3, Target, ArrowRight,
  Clock, TrendingUp, Zap, Star, Calendar,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";


const performanceData = [
  { day: "Mon", score: 65 },
  { day: "Tue", score: 72 },
  { day: "Wed", score: 68 },
  { day: "Thu", score: 80 },
  { day: "Fri", score: 75 },
  { day: "Sat", score: 88 },
  { day: "Sun", score: 84 },
];

const upcomingTests = [
  { id: "1", title: "SSC CGL Tier-1 Full Mock #12", date: "Today, 3:00 PM", duration: "60 min", questions: 100, isFree: false },
  { id: "2", title: "Reasoning & GI Practice Set", date: "Tomorrow, 10:00 AM", duration: "30 min", questions: 50, isFree: true },
  { id: "3", title: "Quantitative Aptitude Sprint", date: "Jul 6, 2:00 PM", duration: "45 min", questions: 75, isFree: false },
];

const recentResults = [
  { exam: "RRB NTPC Mock #8", score: 84, total: 100, rank: 234, date: "Yesterday" },
  { exam: "SSC CGL GK Booster", score: 71, total: 100, rank: 512, date: "2 days ago" },
  { exam: "IBPS PO Prelims #5", score: 92, total: 100, rank: 89, date: "3 days ago" },
];

const statCards = [
  { label: "Tests Attempted", value: "47", change: "+5 this week", icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "Best Score", value: "94%", change: "+3% improvement", icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  { label: "Avg Percentile", value: "78th", change: "Top 22%", icon: BarChart3, color: "text-green-500", bg: "bg-green-500/10" },
  { label: "Study Streak", value: "12 days", change: "🔥 Keep going!", icon: Zap, color: "text-orange-500", bg: "bg-orange-500/10" },
];

export default function StudentDashboard() {
  const { userProfile } = useAuth();
  const firstName = userProfile?.name?.split(" ")[0] || "Student";

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/student/tests" className="btn-primary text-sm px-5 py-2.5">
            <Zap className="w-4 h-4" />
            Start a Test
          </Link>
        </div>
      </motion.div>

      {/* AI Daily Target */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card bg-gradient-to-r from-primary-900/30 to-primary-800/10 border-primary-500/20"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center flex-shrink-0">
            <Target className="w-6 h-6 text-primary-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-display font-bold">AI Daily Target</span>
              <span className="badge-primary text-xs">AI Powered</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Complete 2 more tests today to maintain your streak and improve your Reasoning score by 8%.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-center">
              <div className="font-display font-bold text-2xl text-primary-400">3/5</div>
              <div className="text-xs text-muted-foreground">Tests done</div>
            </div>
            <Link href="/student/tests" className="btn-primary text-xs px-4 py-2">
              Practice Now
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="card"
            >
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div className="font-display text-2xl font-bold mb-0.5">{card.value}</div>
              <div className="text-sm text-muted-foreground">{card.label}</div>
              <div className="text-xs text-green-500 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {card.change}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Performance Chart + Upcoming Tests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-lg">Score Trend (Last 7 Days)</h2>
            <span className="badge-success text-xs">+12% avg improvement</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={performanceData}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3949ab" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3949ab" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} domain={[50, 100]} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#3949ab"
                strokeWidth={2.5}
                fill="url(#scoreGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Upcoming Tests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-base">Upcoming Tests</h2>
            <Link href="/student/tests" className="text-primary-500 text-xs hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {upcomingTests.map((test) => (
              <div key={test.id} className="p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="text-sm font-medium leading-snug">{test.title}</span>
                  {test.isFree ? (
                    <span className="badge-success text-xs flex-shrink-0">Free</span>
                  ) : (
                    <span className="badge-primary text-xs flex-shrink-0">Pro</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{test.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{test.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Results */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-lg">Recent Results</h2>
          <Link href="/student/results" className="text-primary-500 text-sm hover:underline">View all →</Link>
        </div>
        <div className="space-y-3">
          {recentResults.map((result, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                  <Star className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <div className="font-medium text-sm">{result.exam}</div>
                  <div className="text-xs text-muted-foreground">{result.date}</div>
                </div>
              </div>
              <div className="flex items-center gap-6 text-right">
                <div>
                  <div className="font-bold text-lg">{result.score}%</div>
                  <div className="text-xs text-muted-foreground">Score</div>
                </div>
                <div>
                  <div className="font-bold text-base text-primary-400">#{result.rank}</div>
                  <div className="text-xs text-muted-foreground">Rank</div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
