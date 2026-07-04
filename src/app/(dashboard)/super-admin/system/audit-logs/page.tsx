"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { HardDrive, Search, Loader2, Filter, AlertCircle, CheckCircle, Edit, Trash2, Shield } from "lucide-react";
import { db } from "@/lib/firebase/config";
import { collection, query, orderBy, onSnapshot, limit } from "firebase/firestore";

interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  performedByName?: string;
  collection?: string;
  documentId?: string;
  details?: string;
  timestamp: any;
  severity: "info" | "warning" | "error";
}

const SEVERITY_CONFIG = {
  info: { icon: CheckCircle, color: "text-blue-500", bg: "bg-blue-500/10" },
  warning: { icon: AlertCircle, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  error: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" },
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");

  useEffect(() => {
    const q = query(collection(db, "auditLogs"), orderBy("timestamp", "desc"), limit(100));
    const unsub = onSnapshot(q, (snap) => {
      const items: AuditLog[] = [];
      snap.forEach((d) => items.push({ id: d.id, ...d.data() } as AuditLog));
      setLogs(items);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = logs.filter((l) => {
    const matchSearch = l.action.toLowerCase().includes(search.toLowerCase()) ||
      (l.performedByName || "").toLowerCase().includes(search.toLowerCase()) ||
      (l.collection || "").toLowerCase().includes(search.toLowerCase());
    const matchSev = severityFilter === "all" || l.severity === severityFilter;
    return matchSearch && matchSev;
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <HardDrive className="w-7 h-7 text-primary-500" />
          <h1 className="font-display text-2xl md:text-3xl font-bold">Audit Logs</h1>
        </div>
        <p className="text-muted-foreground">All admin actions — immutable records. Showing last 100.</p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input type="text" placeholder="Search logs..." className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-primary-500/50 focus:outline-none" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="bg-card border border-border rounded-xl px-4 py-2.5 focus:outline-none">
          <option value="all">All Severity</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>
      ) : logs.length === 0 ? (
        <div className="card text-center py-16">
          <HardDrive className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-muted-foreground">No audit logs yet. Admin actions will appear here.</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Action</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Performed By</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Collection</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Severity</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((log, i) => {
                const cfg = SEVERITY_CONFIG[log.severity] || SEVERITY_CONFIG.info;
                const Icon = cfg.icon;
                return (
                  <tr key={log.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="font-medium">{log.action}</div>
                      {log.details && <div className="text-xs text-muted-foreground">{log.details}</div>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5" />
                        {log.performedByName || log.performedBy?.slice(0, 10) + "..."}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground hidden lg:table-cell">
                      {log.collection || "—"}{log.documentId && `/${log.documentId.slice(0, 8)}`}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1 text-xs ${cfg.color}`}>
                        <Icon className="w-3.5 h-3.5" />{log.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {log.timestamp?.seconds ? new Date(log.timestamp.seconds * 1000).toLocaleString("en-IN") : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
