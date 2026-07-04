"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users, Search, Loader2, Shield, Mail, Calendar,
  CheckCircle, XCircle, MoreVertical, UserX, UserCheck
} from "lucide-react";
import { db } from "@/lib/firebase/config";
import {
  collection, query, where, orderBy, getDocs,
  updateDoc, doc, limit, startAfter, getCountFromServer
} from "firebase/firestore";
import { toast } from "sonner";

interface UserItem {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  createdAt: any;
  isActive: boolean;
  targetExam?: string;
  phone?: string;
  state?: string;
  subscription?: any;
}

const PAGE_SIZE = 20;

export default function StudentsPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStudents = async (after?: any) => {
    setLoading(true);
    try {
      const constraints: any[] = [
        where("role", "==", "student"),
        orderBy("createdAt", "desc"),
        limit(PAGE_SIZE)
      ];
      if (after) constraints.push(startAfter(after));

      const q = query(collection(db, "users"), ...constraints);
      const snapshot = await getDocs(q);
      const fetched: UserItem[] = [];
      snapshot.forEach((d) => fetched.push({ uid: d.id, ...d.data() } as UserItem));

      setUsers(after ? (prev) => [...prev, ...fetched] : fetched);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === PAGE_SIZE);

      // Get total count once
      if (!after) {
        const countSnap = await getCountFromServer(query(collection(db, "users"), where("role", "==", "student")));
        setTotalCount(countSnap.data().count);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (uid: string, current: boolean) => {
    try {
      await updateDoc(doc(db, "users", uid), { isActive: !current });
      setUsers((prev) => prev.map((u) => u.uid === uid ? { ...u, isActive: !current } : u));
      toast.success(current ? "User deactivated" : "User activated");
    } catch {
      toast.error("Failed to update user status");
    }
    setActiveMenu(null);
  };

  const filtered = users.filter((u) =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <Users className="w-7 h-7 text-primary-500" />
          <h1 className="font-display text-2xl md:text-3xl font-bold">Students</h1>
        </div>
        <p className="text-muted-foreground">Total: {totalCount} registered students</p>
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name or email..."
          className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-primary-500/50 focus:outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Student</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Joined</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Target Exam</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Subscription</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && users.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary-500 mx-auto" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No students found</td></tr>
              ) : filtered.map((user, i) => (
                <motion.tr key={user.uid} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-800 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {user.photoURL ? <img src={user.photoURL} className="w-8 h-8 rounded-full object-cover" alt="" /> : (user.name?.[0] || "?")}
                      </div>
                      <div>
                        <div className="font-medium">{user.name || "—"}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="w-3 h-3" />{user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    <div className="flex items-center gap-1 text-xs">
                      <Calendar className="w-3.5 h-3.5" />
                      {user.createdAt?.seconds ? new Date(user.createdAt.seconds * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">{user.targetExam || "—"}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {user.subscription?.status === "active" ? (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/10 text-green-500 font-medium">Premium</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">Free</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {user.isActive ? (
                      <span className="flex items-center gap-1 text-xs text-green-500">
                        <CheckCircle className="w-3.5 h-3.5" /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-red-500">
                        <XCircle className="w-3.5 h-3.5" /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="relative inline-block">
                      <button
                        onClick={() => setActiveMenu(activeMenu === user.uid ? null : user.uid)}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {activeMenu === user.uid && (
                        <div className="absolute right-0 top-8 z-10 w-44 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                          <button
                            onClick={() => toggleActive(user.uid, user.isActive)}
                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted flex items-center gap-2"
                          >
                            {user.isActive ? <UserX className="w-4 h-4 text-red-500" /> : <UserCheck className="w-4 h-4 text-green-500" />}
                            {user.isActive ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={() => fetchStudents(lastDoc)}
            disabled={loading}
            className="btn-ghost flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
