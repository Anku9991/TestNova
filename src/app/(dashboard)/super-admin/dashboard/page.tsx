"use client";

import { motion } from "framer-motion";
import {
  Users, IndianRupee, TrendingUp, BarChart3, Activity,
  ShieldCheck, AlertCircle, CheckCircle,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

const kpiCards = [
  { label: "Total Revenue", value: "₹24.8L", change: "+18.2%", icon: IndianRupee, color: "text-green-500", bg: "bg-green-500/10", positive: true },
  { label: "Active Students", value: "8,342", change: "+12.4%", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10", positive: true },
  { label: "Active Subscriptions", value: "3,127", change: "+8.7%", icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-500/10", positive: true },
  { label: "Tests Attempted Today", value: "1,893", change: "+31.5%", icon: BarChart3, color: "text-orange-500", bg: "bg-orange-500/10", positive: true },
];

const revenueData = [
  { month: "Jan", revenue: 185000, subscriptions: 142 },
  { month: "Feb", revenue: 215000, subscriptions: 168 },
  { month: "Mar", revenue: 198000, subscriptions: 155 },
  { month: "Apr", revenue: 241000, subscriptions: 187 },
  { month: "May", revenue: 278000, subscriptions: 214 },
  { month: "Jun", revenue: 312000, subscriptions: 246 },
  { month: "Jul", revenue: 248000, subscriptions: 198 },
];

const planDistribution = [
  { name: "Free", value: 5215, color: "#64748b" },
  { name: "Pro Monthly", value: 1892, color: "#3949ab" },
  { name: "Annual", value: 1235, color: "#f9a825" },
];

const examAttempts = [
  { name: "SSC", attempts: 4821 },
  { name: "Railway", attempts: 3642 },
  { name: "Banking", attempts: 3201 },
  { name: "UPSC", attempts: 1897 },
  { name: "Defence", attempts: 1234 },
  { name: "Teaching", attempts: 987 },
];

const recentActivity = [
  { action: "New user registered", detail: "Rahul Kumar — SSC CGL aspirant", time: "2 min ago", type: "success" },
  { action: "Payment received", detail: "₹2,999 — Annual Plan — Priya Sharma", time: "8 min ago", type: "success" },
  { action: "Exam created", detail: 'RRB NTPC Mock #15 published by Admin', time: "15 min ago", type: "info" },
  { action: "Support ticket", detail: "Ticket #1042 — Payment issue", time: "22 min ago", type: "warning" },
  { action: "Failed login attempt", detail: "Repeated failed attempts — IP blocked", time: "1 hr ago", type: "error" },
];

export default function SuperAdminDashboard() {
  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-1">
          <ShieldCheck className="w-6 h-6 text-primary-500" />
          <h1 className="font-display text-2xl md:text-3xl font-bold">Super Admin Dashboard</h1>
        </div>
        <p className="text-muted-foreground">Platform overview — ExamNexa Production</p>
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold">Revenue (2025)</h2>
            <span className="badge-success text-xs">+38% YoY</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
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
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }}
                formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]}
              />
              <Area type="monotone" dataKey="revenue" stroke="#3949ab" strokeWidth={2.5} fill="url(#revenueGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Plan Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="card"
        >
          <h2 className="font-display font-bold mb-4">Plan Distribution</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={planDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {planDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend formatter={(value) => <span style={{ fontSize: 12 }}>{value}</span>} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {planDistribution.map((plan) => (
              <div key={plan.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: plan.color }} />
                  <span className="text-muted-foreground">{plan.name}</span>
                </div>
                <span className="font-semibold">{plan.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exam Attempts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <h2 className="font-display font-bold mb-6">Attempts by Category</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={examAttempts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={60} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
              <Bar dataKey="attempts" fill="#3949ab" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="card"
        >
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-primary-500" />
            <h2 className="font-display font-bold">Recent Activity</h2>
          </div>
          <div className="space-y-3">
            {recentActivity.map((item, i) => (
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
                <span className="text-xs text-muted-foreground flex-shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
