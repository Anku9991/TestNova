"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users, IndianRupee, TrendingUp, BarChart3, Activity,
  ShieldCheck, AlertCircle, CheckCircle,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { db } from "@/lib/firebase/config";
import { collection, getCountFromServer, getDocs, query, limit, orderBy } from "firebase/firestore";

const PLAN_COLORS: Record<string, string> = {
  "Free": "#64748b",
  "Pro Monthly": "#3949ab",
  "Annual": "#f9a825",
  "default": "#10b981"
};

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({ users: 0, exams: 0, questions: 0, results: 0 });
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [planDistribution, setPlanDistribution] = useState<any[]>([]);
  const [examAttempts, setExamAttempts] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!db) return;
      try {
        // 1. KPI Stats
        const [usersSnap, examsSnap, qSnap, resSnap] = await Promise.all([
          getCountFromServer(collection(db, "users")),
          getCountFromServer(collection(db, "exams")),
          getCountFromServer(collection(db, "questions")),
          getCountFromServer(collection(db, "results"))
        ]);
        setStats({
          users: usersSnap.data().count,
          exams: examsSnap.data().count,
          questions: qSnap.data().count,
          results: resSnap.data().count
        });

        // 2. Fetch recent subscriptions for Revenue & Plan Distribution
        const subsSnap = await getDocs(query(collection(db, "subscriptions"), orderBy("createdAt", "desc"), limit(200)));
        const revMap: Record<string, number> = {};
        const planMap: Record<string, number> = {};
        
        subsSnap.forEach(doc => {
          const data = doc.data();
          
          // Revenue Mapping (by month-year)
          if (data.createdAt?.seconds) {
            const date = new Date(data.createdAt.seconds * 1000);
            const month = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
            revMap[month] = (revMap[month] || 0) + (data.amount || 0);
          }
          
          // Plan Distribution
          const planName = data.planName || "Unknown";
          planMap[planName] = (planMap[planName] || 0) + 1;
        });

        setRevenueData(Object.entries(revMap).reverse().map(([month, revenue]) => ({ month, revenue })));
        setPlanDistribution(Object.entries(planMap).map(([name, value]) => ({ 
          name, 
          value, 
          color: PLAN_COLORS[name] || PLAN_COLORS.default 
        })));

        // 3. Fetch recent Results for Exam Attempts distribution
        const recentResSnap = await getDocs(query(collection(db, "results"), orderBy("createdAt", "desc"), limit(100)));
        const examCountMap: Record<string, number> = {};
        recentResSnap.forEach(doc => {
          const examId = doc.data().examId || "Unknown";
          examCountMap[examId] = (examCountMap[examId] || 0) + 1;
        });
        
        // Let's just use the IDs for now, in a real app we'd map these to exam titles
        setExamAttempts(Object.entries(examCountMap).slice(0, 6).map(([name, attempts]) => ({
          name: name.length > 10 ? name.slice(0, 6) + "..." : name,
          attempts
        })));

        // 4. Fetch Audit Logs for Recent Activity
        const logsSnap = await getDocs(query(collection(db, "auditLogs"), orderBy("timestamp", "desc"), limit(5)));
        setRecentActivity(logsSnap.docs.map(d => {
          const data = d.data();
          const time = data.timestamp?.seconds ? new Date(data.timestamp.seconds * 1000).toLocaleString("en-IN") : "Just now";
          return {
            action: data.action,
            detail: data.details || `Performed by ${data.performedByName || "Admin"}`,
            time,
            type: data.severity === "error" ? "error" : data.severity === "warning" ? "warning" : "info"
          };
        }));

      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  const kpiCards = [
    { label: "Total Users", value: stats.users.toString(), change: "Live", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10", positive: true },
    { label: "Total Exams", value: stats.exams.toString(), change: "Live", icon: ShieldCheck, color: "text-green-500", bg: "bg-green-500/10", positive: true },
    { label: "Total Questions", value: stats.questions.toString(), change: "Live", icon: Activity, color: "text-purple-500", bg: "bg-purple-500/10", positive: true },
    { label: "Tests Attempted", value: stats.results.toString(), change: "Live", icon: BarChart3, color: "text-orange-500", bg: "bg-orange-500/10", positive: true },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <ShieldCheck className="w-6 h-6 text-primary-500" />
          <h1 className="font-display text-2xl md:text-3xl font-bold">Super Admin Dashboard</h1>
        </div>
        <p className="text-muted-foreground">Platform overview — Real-time Firestore Data</p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <span className={`text-xs font-semibold flex items-center gap-1 ${kpi.positive ? "text-green-500" : "text-red-500"}`}>
                  <TrendingUp className="w-3 h-3" />
                  {kpi.change}
                </span>
              </div>
              <div className="font-display text-2xl font-bold mb-0.5">{kpi.value}</div>
              <div className="text-sm text-muted-foreground">{kpi.label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold">Revenue</h2>
            {revenueData.length === 0 && <span className="text-xs text-muted-foreground">No data yet</span>}
          </div>
          <ResponsiveContainer width="100%" height={220}>
            {revenueData.length > 0 ? (
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3949ab" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3949ab" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }} formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]} />
                <Area type="monotone" dataKey="revenue" stroke="#3949ab" strokeWidth={2.5} fill="url(#revenueGradient)" />
              </AreaChart>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground border-2 border-dashed border-border rounded-xl">Insufficient Data</div>
            )}
          </ResponsiveContainer>
        </motion.div>

        {/* Plan Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card">
          <h2 className="font-display font-bold mb-4">Plan Distribution</h2>
          <ResponsiveContainer width="100%" height={180}>
            {planDistribution.length > 0 ? (
              <PieChart>
                <Pie data={planDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {planDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Legend formatter={(value) => <span style={{ fontSize: 12 }}>{value}</span>} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
              </PieChart>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground border-2 border-dashed border-border rounded-xl text-sm">No Active Plans</div>
            )}
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exam Attempts */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card">
          <h2 className="font-display font-bold mb-6">Recent Exam Attempts</h2>
          <ResponsiveContainer width="100%" height={200}>
            {examAttempts.length > 0 ? (
              <BarChart data={examAttempts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={60} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                <Bar dataKey="attempts" fill="#3949ab" radius={[0, 4, 4, 0]} />
              </BarChart>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground border-2 border-dashed border-border rounded-xl text-sm">No Attempts Recorded</div>
            )}
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="card overflow-y-auto max-h-[300px]">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-primary-500" />
            <h2 className="font-display font-bold">Recent Activity</h2>
          </div>
          <div className="space-y-3">
            {recentActivity.length > 0 ? recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  item.type === "success" ? "bg-green-500/10" :
                  item.type === "error" ? "bg-red-500/10" :
                  item.type === "warning" ? "bg-yellow-500/10" : "bg-blue-500/10"
                }`}>
                  {item.type === "success" ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> :
                   item.type === "error" ? <AlertCircle className="w-3.5 h-3.5 text-red-500" /> :
                   item.type === "warning" ? <AlertCircle className="w-3.5 h-3.5 text-yellow-500" /> :
                   <Activity className="w-3.5 h-3.5 text-blue-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{item.action}</div>
                  <div className="text-xs text-muted-foreground truncate">{item.detail}</div>
                </div>
                <span className="text-[10px] text-muted-foreground flex-shrink-0">{item.time}</span>
              </div>
            )) : (
              <div className="text-center py-8 text-muted-foreground text-sm">No recent activity</div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
