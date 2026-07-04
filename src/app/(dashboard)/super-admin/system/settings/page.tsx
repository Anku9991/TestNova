"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Settings, Globe, Bell, Shield, Save, Loader2,
  Mail, Phone, MapPin, Link as LinkIcon
} from "lucide-react";
import { db } from "@/lib/firebase/config";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";

interface SiteSettings {
  siteName: string;
  tagline: string;
  supportEmail: string;
  supportPhone: string;
  address: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  maxFreeTests: number;
  defaultCurrency: string;
  razorpayKeyId: string;
  updatedAt?: any;
}

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "TestNova",
  tagline: "India's Premier CBT Platform",
  supportEmail: "support@testnova.in",
  supportPhone: "+91 98765 43210",
  address: "New Delhi, India",
  maintenanceMode: false,
  allowRegistration: true,
  requireEmailVerification: false,
  maxFreeTests: 5,
  defaultCurrency: "INR",
  razorpayKeyId: "",
};

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const snap = await getDoc(doc(db, "settings", "site"));
        if (snap.exists()) {
          setSettings({ ...DEFAULT_SETTINGS, ...snap.data() });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "site"), {
        ...settings,
        updatedAt: serverTimestamp(),
      });
      toast.success("Settings saved successfully!");
    } catch (err) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <Settings className="w-7 h-7 text-primary-500" />
          <h1 className="font-display text-2xl md:text-3xl font-bold">System Settings</h1>
        </div>
        <p className="text-muted-foreground">Configure platform-wide settings</p>
      </motion.div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <Globe className="w-5 h-5 text-primary-500" />
            <h2 className="font-display font-bold">General</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">Site Name</label>
              <input type="text" value={settings.siteName} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/50 focus:outline-none" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Tagline</label>
              <input type="text" value={settings.tagline} onChange={(e) => setSettings({ ...settings, tagline: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/50 focus:outline-none" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5 flex items-center gap-1"><Mail className="w-4 h-4" /> Support Email</label>
              <input type="email" value={settings.supportEmail} onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/50 focus:outline-none" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5 flex items-center gap-1"><Phone className="w-4 h-4" /> Support Phone</label>
              <input type="text" value={settings.supportPhone} onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/50 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5 flex items-center gap-1"><MapPin className="w-4 h-4" /> Address</label>
            <input type="text" value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/50 focus:outline-none" />
          </div>
        </motion.div>

        {/* Access Control */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <Shield className="w-5 h-5 text-primary-500" />
            <h2 className="font-display font-bold">Access Control</h2>
          </div>
          <div className="space-y-3">
            {[
              { key: "maintenanceMode", label: "Maintenance Mode", description: "Disable access for all non-admin users" },
              { key: "allowRegistration", label: "Allow New Registration", description: "Allow new users to create accounts" },
              { key: "requireEmailVerification", label: "Require Email Verification", description: "Users must verify email before accessing platform" },
            ].map((toggle) => (
              <label key={toggle.key} className="flex items-center justify-between p-4 rounded-xl bg-muted/50 cursor-pointer">
                <div>
                  <div className="font-medium text-sm">{toggle.label}</div>
                  <div className="text-xs text-muted-foreground">{toggle.description}</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings[toggle.key as keyof SiteSettings] as boolean}
                  onChange={(e) => setSettings({ ...settings, [toggle.key]: e.target.checked })}
                  className="w-4 h-4"
                />
              </label>
            ))}
            <div>
              <label className="text-sm font-medium block mb-1.5">Max Free Tests per Student</label>
              <input type="number" min={0} value={settings.maxFreeTests} onChange={(e) => setSettings({ ...settings, maxFreeTests: Number(e.target.value) })} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/50 focus:outline-none max-w-xs" />
            </div>
          </div>
        </motion.div>

        {/* Payment */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <LinkIcon className="w-5 h-5 text-primary-500" />
            <h2 className="font-display font-bold">Payment Gateway</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">Default Currency</label>
              <select value={settings.defaultCurrency} onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/50 focus:outline-none">
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Razorpay Key ID (Public)</label>
              <input type="text" value={settings.razorpayKeyId} onChange={(e) => setSettings({ ...settings, razorpayKeyId: e.target.value })} placeholder="rzp_live_..." className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/50 focus:outline-none font-mono text-sm" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">⚠️ Secret keys should only be set via environment variables on the server — never store them in Firestore.</p>
        </motion.div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
