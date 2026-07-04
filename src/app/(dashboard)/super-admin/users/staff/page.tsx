"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield, Search, Loader2, Mail, Calendar, Users,
  CheckCircle, XCircle, Plus, MoreVertical, UserX, UserCheck, Pencil
} from "lucide-react";
import { db } from "@/lib/firebase/config";
import {
  collection, query, where, orderBy, getDocs,
  updateDoc, doc
} from "firebase/firestore";
import { toast } from "sonner";
import type { UserRole } from "@/types";

interface StaffMember {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: any;
}

const STAFF_ROLES: UserRole[] = ["admin", "teacher", "content_manager", "super_admin"];

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [editingUser, setEditingUser] = useState<StaffMember | null>(null);
  const [newRole, setNewRole] = useState<UserRole>("teacher");

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "users"),
        where("role", "in", STAFF_ROLES),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const fetched: StaffMember[] = [];
      snapshot.forEach((d) => fetched.push({ uid: d.id, ...d.data() } as StaffMember));
      setStaff(fetched);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load staff");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!editingUser) return;
    try {
      await updateDoc(doc(db, "users", editingUser.uid), { role: newRole });
      setStaff((prev) => prev.map((u) => u.uid === editingUser.uid ? { ...u, role: newRole } : u));
      toast.success("Role updated successfully");
      setEditingUser(null);
    } catch {
      toast.error("Failed to update role");
    }
  };

  const toggleActive = async (uid: string, current: boolean) => {
    try {
      await updateDoc(doc(db, "users", uid), { isActive: !current });
      setStaff((prev) => prev.map((u) => u.uid === uid ? { ...u, isActive: !current } : u));
      toast.success(current ? "Staff member deactivated" : "Staff member activated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const getRoleBadge = (role: UserRole) => {
    const map: Record<string, string> = {
      super_admin: "bg-purple-500/10 text-purple-500",
      admin: "bg-blue-500/10 text-blue-500",
      teacher: "bg-green-500/10 text-green-500",
      content_manager: "bg-orange-500/10 text-orange-500",
    };
    return map[role] || "bg-muted text-muted-foreground";
  };

  const filtered = staff.filter((u) => {
    const matchSearch = u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Shield className="w-7 h-7 text-primary-500" />
              <h1 className="font-display text-2xl md:text-3xl font-bold">Staff Management</h1>
            </div>
            <p className="text-muted-foreground">{staff.length} staff members</p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-primary-500/50 focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-card border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/50 focus:outline-none"
        >
          <option value="all">All Roles</option>
          {STAFF_ROLES.map((r) => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Member</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Role</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Joined</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary-500 mx-auto" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">No staff found</td></tr>
              ) : filtered.map((member, i) => (
                <motion.tr key={member.uid} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-800 flex items-center justify-center text-white text-xs font-bold">
                        {member.name?.[0] || "?"}
                      </div>
                      <div>
                        <div className="font-medium">{member.name || "—"}</div>
                        <div className="text-xs text-muted-foreground">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getRoleBadge(member.role)}`}>
                      {member.role.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell text-xs">
                    {member.createdAt?.seconds ? new Date(member.createdAt.seconds * 1000).toLocaleDateString("en-IN") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {member.isActive ? (
                      <span className="flex items-center gap-1 text-xs text-green-500"><CheckCircle className="w-3.5 h-3.5" /> Active</span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-red-500"><XCircle className="w-3.5 h-3.5" /> Inactive</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => { setEditingUser(member); setNewRole(member.role); }}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary-500 transition-colors"
                        title="Change Role"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleActive(member.uid, member.isActive)}
                        className={`p-1.5 rounded-lg hover:bg-muted transition-colors ${member.isActive ? "text-red-500" : "text-green-500"}`}
                        title={member.isActive ? "Deactivate" : "Activate"}
                      >
                        {member.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card max-w-sm w-full">
            <h2 className="font-display font-bold text-lg mb-4">Change Role: {editingUser.name}</h2>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as UserRole)}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 mb-4 focus:ring-2 focus:ring-primary-500/50 focus:outline-none"
            >
              {STAFF_ROLES.map((r) => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
            </select>
            <div className="flex gap-3">
              <button onClick={() => setEditingUser(null)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={handleUpdateRole} className="btn-primary flex-1">Save Role</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
