"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Tag, Plus, Search, Loader2, Trash2, Edit, XCircle,
  CheckCircle, Copy, AlertCircle
} from "lucide-react";
import { db } from "@/lib/firebase/config";
import {
  collection, query, orderBy, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp
} from "firebase/firestore";
import { toast } from "sonner";

interface Coupon {
  id: string;
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  maxUses: number;
  usedCount: number;
  expiresAt?: any;
  isActive: boolean;
  createdAt: any;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [search, setSearch] = useState("");

  // Form state
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percent" | "fixed">("percent");
  const [discountValue, setDiscountValue] = useState(10);
  const [maxUses, setMaxUses] = useState(100);
  const [expiresAt, setExpiresAt] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "coupons"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const items: Coupon[] = [];
      snap.forEach((d) => items.push({ id: d.id, ...d.data() } as Coupon));
      setCoupons(items);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const openModal = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setCode(coupon.code);
      setDiscountType(coupon.discountType);
      setDiscountValue(coupon.discountValue);
      setMaxUses(coupon.maxUses);
      setIsActive(coupon.isActive);
      setExpiresAt(coupon.expiresAt?.seconds
        ? new Date(coupon.expiresAt.seconds * 1000).toISOString().slice(0, 10) : "");
    } else {
      setEditingCoupon(null);
      setCode("");
      setDiscountType("percent");
      setDiscountValue(10);
      setMaxUses(100);
      setIsActive(true);
      setExpiresAt("");
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const data: any = {
      code: code.toUpperCase().trim(),
      discountType,
      discountValue,
      maxUses,
      isActive,
      updatedAt: serverTimestamp(),
    };
    if (expiresAt) data.expiresAt = new Date(expiresAt);

    try {
      if (editingCoupon) {
        await updateDoc(doc(db, "coupons", editingCoupon.id), data);
        toast.success("Coupon updated!");
      } else {
        await addDoc(collection(db, "coupons"), {
          ...data,
          usedCount: 0,
          createdAt: serverTimestamp(),
        });
        toast.success("Coupon created!");
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error("Failed to save coupon");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    try {
      await deleteDoc(doc(db, "coupons", id));
      toast.success("Coupon deleted");
    } catch {
      toast.error("Failed to delete coupon");
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Copied: ${code}`);
  };

  const filtered = coupons.filter((c) =>
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "TN";
    for (let i = 0; i < 6; i++) result += chars[Math.floor(Math.random() * chars.length)];
    setCode(result);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Tag className="w-7 h-7 text-primary-500" />
            <h1 className="font-display text-2xl md:text-3xl font-bold">Coupons</h1>
          </div>
          <p className="text-muted-foreground">{coupons.length} coupons total</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary">
          <Plus className="w-5 h-5" /> Create Coupon
        </button>
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input type="text" placeholder="Search by code..." className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-primary-500/50 focus:outline-none" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Code</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Discount</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Uses</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Expires</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">No coupons found</td></tr>
              ) : filtered.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-primary-500">{coupon.code}</span>
                      <button onClick={() => handleCopyCode(coupon.code)} className="p-1 rounded hover:bg-muted"><Copy className="w-3.5 h-3.5 text-muted-foreground" /></button>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    {coupon.discountType === "percent" ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                    {coupon.usedCount}/{coupon.maxUses}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">
                    {coupon.expiresAt?.seconds ? new Date(coupon.expiresAt.seconds * 1000).toLocaleDateString("en-IN") : "No Expiry"}
                  </td>
                  <td className="px-4 py-3">
                    {coupon.isActive ? (
                      <span className="flex items-center gap-1 text-xs text-green-500"><CheckCircle className="w-3.5 h-3.5" /> Active</span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground"><XCircle className="w-3.5 h-3.5" /> Inactive</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openModal(coupon)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary-500"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(coupon.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display font-bold text-xl">{editingCoupon ? "Edit Coupon" : "Create Coupon"}</h2>
              <button onClick={() => setIsModalOpen(false)}><XCircle className="w-6 h-6 text-muted-foreground" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">Coupon Code</label>
                <div className="flex gap-2">
                  <input required type="text" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/50 focus:outline-none font-mono" placeholder="e.g. SAVE20" />
                  <button type="button" onClick={generateCode} className="btn-ghost text-xs px-3">Auto</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1.5">Discount Type</label>
                  <select value={discountType} onChange={(e) => setDiscountType(e.target.value as any)} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/50 focus:outline-none">
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Discount Value</label>
                  <input required type="number" min={1} value={discountValue} onChange={(e) => setDiscountValue(Number(e.target.value))} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/50 focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1.5">Max Uses</label>
                  <input required type="number" min={1} value={maxUses} onChange={(e) => setMaxUses(Number(e.target.value))} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/50 focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Expires On (optional)</label>
                  <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/50 focus:outline-none" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="w-4 h-4" />
                <span className="text-sm font-medium">Active</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-ghost flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Save Coupon</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
