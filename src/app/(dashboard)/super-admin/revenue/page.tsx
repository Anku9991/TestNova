"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  IndianRupee, TrendingUp, Users, CreditCard,
  Loader2, Calendar, CheckCircle, Clock, XCircle
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from "recharts";
import { db } from "@/lib/firebase/config";
import {
  collection, query, orderBy, getDocs, where,
  getCountFromServer, limit
} from "firebase/firestore";

export default function RevenuePage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeSubscriptions: 0,
    totalSubscriptions: 0,
    expiredSubscriptions: 0,
  });
  const [recentSubs, setRecentSubs] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Get all subscriptions
      const subsSnap = await getDocs(query(collection(db, "subscriptions"), orderBy("startDate", "desc"), limit(100)));
      const subs: any[] = [];
      subsSnap.forEach((d) => subs.push({ id: d.id, ...d.data() }));

      // Calculate stats
      const active = subs.filter((s) => s.status === "active").length;
      const expired = subs.filter((s) => s.status === "expired" || s.status === "cancelled").length;
      const totalRevenue = subs.filter((s) => s.status === "active" || s.status === "expired")
        .reduce((acc, s) => acc + (s.amount || 0), 0);

      setStats({
        totalRevenue,
        activeSubscriptions: active,
        totalSubscriptions: subs.length,
        expiredSubscriptions: expired,
      });

      // Recent 10 subscriptions
      setRecentSubs(subs.slice(0, 10));

      // Build monthly revenue from subs
      const monthMap: Record<string, number> = {};
      subs.forEach((s) => {
        if (!s.startDate?.seconds) return;
        const date = new Date(s.startDate.seconds * 1000);
        const key = date.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
        monthMap[key] = (monthMap[key] || 0) + (s.amount || 0);
      });
      const monthArray = Object.entries(monthMap)
        .slice(-7)
        .map(([month, revenue]) => ({ month, revenue }));
      setMonthlyData(monthArray);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "expired": return <Clock className="w-4 h-4 text-yellow-500" />;
      case "cancelled": return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>;
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <IndianRupee className="w-7 h-7 text-primary-500" />
          <h1 className="font-display text-2xl md:text-3xl font-bold">Revenue Dashboard</h1>
        </div>
        <p className="text-muted-foreground">Real-time subscription & payment analytics</p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-green-500", bg: "bg-green-500/10" },
          { label: "Active Subscriptions", value: stats.activeSubscriptions, icon: CreditCard, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Total Subscribers", value: stats.totalSubscriptions, icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
          { label: "Expired/Cancelled", value: stats.expiredSubscriptions, icon: TrendingUp, color: "text-orange-500", bg: "bg-orange-500/10" },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card">
              <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <div className="font-display text-2xl font-bold">{kpi.value}</div>
              <div className="text-sm text-muted-foreground">{kpi.label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Chart */}
      {monthlyData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
          <h2 className="font-display font-bold mb-6">Monthly Revenue</h2>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }}
                formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]}
              />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Recent Subscriptions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-display font-bold">Recent Subscriptions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">User ID</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Plan</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Amount</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentSubs.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No subscription data yet</td></tr>
              ) : recentSubs.map((sub) => (
                <tr key={sub.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{sub.userId?.slice(0, 10)}...</td>
                  <td className="px-4 py-3 font-medium">{sub.planName || "—"}</td>
                  <td className="px-4 py-3 font-semibold text-green-500">₹{(sub.amount || 0).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {sub.startDate?.seconds ? new Date(sub.startDate.seconds * 1000).toLocaleDateString("en-IN") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-xs capitalize">
                      {getStatusIcon(sub.status)} {sub.status}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
