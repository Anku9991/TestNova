"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CreditCard, Plus, Search, Loader2, Edit, Trash2, XCircle,
  Star, CheckCircle, Users, IndianRupee
} from "lucide-react";
import { db } from "@/lib/firebase/config";
import {
  collection, query, orderBy, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp
} from "firebase/firestore";
import { toast } from "sonner";
import type { Plan } from "@/types";

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [originalPrice, setOriginalPrice] = useState<number | undefined>(undefined);
  const [duration, setDuration] = useState(30);
  const [features, setFeatures] = useState<string[]>([""]);
  const [isPopular, setIsPopular] = useState(false);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "plans"), orderBy("price", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const items: Plan[] = [];
      snap.forEach((d) => items.push({ id: d.id, ...d.data() } as Plan));
      setPlans(items);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const openModal = (plan?: Plan) => {
    if (plan) {
      setEditingPlan(plan);
      setName(plan.name);
      setDescription(plan.description);
      setPrice(plan.price);
      setOriginalPrice(plan.originalPrice);
      setDuration(plan.duration);
      setFeatures(plan.features.length > 0 ? plan.features : [""]);
      setIsPopular(plan.isPopular);
      setIsActive(plan.isActive);
    } else {
      setEditingPlan(null);
      setName("");
      setDescription("");
      setPrice(0);
      setOriginalPrice(undefined);
      setDuration(30);
      setFeatures([""]);
      setIsPopular(false);
      setIsActive(true);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanFeatures = features.filter((f) => f.trim() !== "");
    const data: any = {
      name, description, price,
      currency: "INR", duration,
      features: cleanFeatures,
      isPopular, isActive,
      examsIncluded: "all",
      updatedAt: serverTimestamp(),
    };
    if (originalPrice) data.originalPrice = originalPrice;

    try {
      if (editingPlan) {
        await updateDoc(doc(db, "plans", editingPlan.id), data);
        toast.success("Plan updated!");
      } else {
        await addDoc(collection(db, "plans"), { ...data, createdAt: serverTimestamp() });
        toast.success("Plan created!");
      }
      setIsModalOpen(false);
    } catch {
      toast.error("Failed to save plan");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this plan? Students on this plan may be affected.")) return;
    try {
      await deleteDoc(doc(db, "plans", id));
      toast.success("Plan deleted");
    } catch {
      toast.error("Failed to delete plan");
    }
  };

  const addFeatureField = () => setFeatures([...features, ""]);
  const updateFeature = (i: number, val: string) => {
    const updated = [...features];
    updated[i] = val;
    setFeatures(updated);
  };
  const removeFeature = (i: number) => setFeatures(features.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <CreditCard className="w-7 h-7 text-primary-500" />
            <h1 className="font-display text-2xl md:text-3xl font-bold">Subscription Plans</h1>
          </div>
          <p className="text-muted-foreground">Manage pricing plans for students</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary">
          <Plus className="w-5 h-5" /> Add Plan
        </button>
      </motion.div>

      {/* Plans Grid */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>
      ) : plans.length === 0 ? (
        <div className="card text-center py-16">
          <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-muted-foreground mb-4">No subscription plans yet</p>
          <button onClick={() => openModal()} className="btn-primary">Create First Plan</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`card relative flex flex-col ${plan.isPopular ? "border-primary-500 shadow-glow" : ""} ${!plan.isActive ? "opacity-60" : ""}`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary-500 text-white text-xs font-bold flex items-center gap-1">
                  <Star className="w-3 h-3" /> Most Popular
                </div>
              )}

              <div className="flex justify-between items-start mb-4">
                <h3 className="font-display text-xl font-bold">{plan.name}</h3>
                {!plan.isActive && <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Inactive</span>}
              </div>

              <div className="flex items-end gap-2 mb-2">
                <span className="font-display text-3xl font-bold">₹{plan.price}</span>
                <span className="text-muted-foreground mb-1">/{plan.duration === 30 ? "mo" : plan.duration === 365 ? "yr" : `${plan.duration}d`}</span>
              </div>
              {plan.originalPrice && (
                <div className="text-sm text-muted-foreground line-through mb-3">₹{plan.originalPrice}</div>
              )}

              <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>

              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f, fi) => (
                  <li key={fi} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="flex gap-2 pt-4 border-t border-border">
                <button onClick={() => openModal(plan)} className="btn-ghost flex-1 border border-border text-sm py-2 flex items-center justify-center gap-1">
                  <Edit className="w-4 h-4" /> Edit
                </button>
                <button onClick={() => handleDelete(plan.id)} className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 flex items-center justify-center">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card max-w-lg w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h2 className="font-display font-bold text-xl">{editingPlan ? "Edit Plan" : "Create Plan"}</h2>
              <button onClick={() => setIsModalOpen(false)}><XCircle className="w-6 h-6 text-muted-foreground" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4 overflow-y-auto flex-1 pr-2">
              <div>
                <label className="text-sm font-medium block mb-1.5">Plan Name</label>
                <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/50 focus:outline-none" placeholder="e.g. Pro Monthly" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Description</label>
                <input required type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/50 focus:outline-none" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1.5">Price (₹)</label>
                  <input required type="number" min={0} value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/50 focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Original (₹)</label>
                  <input type="number" min={0} value={originalPrice || ""} onChange={(e) => setOriginalPrice(e.target.value ? Number(e.target.value) : undefined)} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/50 focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Duration (days)</label>
                  <input required type="number" min={1} value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/50 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Features</label>
                {features.map((f, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input type="text" value={f} onChange={(e) => updateFeature(i, e.target.value)} className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/50 focus:outline-none text-sm" placeholder={`Feature ${i + 1}`} />
                    {features.length > 1 && <button type="button" onClick={() => removeFeature(i)} className="text-red-500 hover:bg-red-500/10 rounded-xl px-2"><XCircle className="w-4 h-4" /></button>}
                  </div>
                ))}
                <button type="button" onClick={addFeatureField} className="text-sm text-primary-500 hover:underline mt-1">+ Add Feature</button>
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={isPopular} onChange={(e) => setIsPopular(e.target.checked)} className="w-4 h-4" />
                  <span className="text-sm font-medium">Most Popular</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="w-4 h-4" />
                  <span className="text-sm font-medium">Active</span>
                </label>
              </div>
              <div className="flex gap-3 pt-2 shrink-0">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-ghost flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Save Plan</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
