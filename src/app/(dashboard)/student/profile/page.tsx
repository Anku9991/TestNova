"use client";

export const dynamic = "force-dynamic";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  User, Camera, Save, Loader2, Phone, MapPin, Target,
  Mail, Shield, CheckCircle
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { db, storage } from "@/lib/firebase/config";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { toast } from "sonner";
import { getInitials } from "@/lib/utils";

const TARGET_EXAMS = [
  "SSC CGL", "SSC CHSL", "SSC MTS", "SSC GD",
  "RRB NTPC", "RRB Group D", "IBPS PO", "IBPS Clerk",
  "SBI PO", "SBI Clerk", "UPSC CSE", "NDA", "CDS",
  "CTET", "State PSC", "Other"
];

const STATES = [
  "Andhra Pradesh", "Bihar", "Delhi", "Gujarat", "Haryana",
  "Karnataka", "Maharashtra", "Madhya Pradesh", "Punjab",
  "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh",
  "West Bengal", "Other"
];

export default function StudentProfilePage() {
  const { user, userProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(userProfile?.name || "");
  const [phone, setPhone] = useState(userProfile?.phone || "");
  const [state, setState] = useState(userProfile?.state || "");
  const [targetExam, setTargetExam] = useState(userProfile?.targetExam || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userProfile) return;
    setSaving(true);

    try {
      let photoURL = userProfile.photoURL;

      // Upload photo if changed
      if (photoFile && storage) {
        setUploading(true);
        const storageRef = ref(storage, `profile-photos/${user.uid}`);
        await uploadBytes(storageRef, photoFile);
        photoURL = await getDownloadURL(storageRef);
        setUploading(false);
      }

      // Update Firebase Auth profile
      if (auth?.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: name,
          photoURL,
        });
      }

      // Update Firestore user document
      await updateDoc(doc(db, "users", user.uid), {
        name,
        phone,
        state,
        targetExam,
        photoURL,
        updatedAt: serverTimestamp(),
      });

      toast.success("Profile updated successfully!");
      setPhotoFile(null);
      setPhotoPreview(null);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const displayPhoto = photoPreview || userProfile?.photoURL;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <User className="w-7 h-7 text-primary-500" />
          <h1 className="font-display text-2xl md:text-3xl font-bold">My Profile</h1>
        </div>
        <p className="text-muted-foreground">Manage your personal information</p>
      </motion.div>

      {/* Profile Photo */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card flex flex-col sm:flex-row items-center gap-6">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-primary-500 to-primary-800 flex items-center justify-center flex-shrink-0">
            {displayPhoto && (displayPhoto.startsWith("http") || displayPhoto.startsWith("data:")) ? (
              <img src={displayPhoto} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-3xl font-bold">
                {getInitials(userProfile?.name || "User")}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary-500 hover:bg-primary-400 flex items-center justify-center text-white transition-colors"
          >
            <Camera className="w-4 h-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
          />
        </div>

        <div className="flex-1 text-center sm:text-left">
          <h3 className="font-display font-bold text-xl">{userProfile?.name || "Student"}</h3>
          <div className="flex items-center gap-1.5 justify-center sm:justify-start mt-1">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">{userProfile?.email}</p>
          </div>
          <div className="flex items-center gap-1.5 justify-center sm:justify-start mt-1">
            <Shield className="w-4 h-4 text-muted-foreground" />
            <p className="text-muted-foreground text-sm capitalize">{userProfile?.role?.replace("_", " ")} Account</p>
          </div>
          {userProfile?.subscription?.status === "active" && (
            <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">
              <CheckCircle className="w-3.5 h-3.5" />
              Premium Active
            </span>
          )}
        </div>
      </motion.div>

      {/* Edit Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSave}
        className="card space-y-6"
      >
        <h2 className="font-semibold text-lg border-b border-border pb-3">Personal Information</h2>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" /> Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/50 focus:outline-none"
              placeholder="Your full name"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" /> Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/50 focus:outline-none"
              placeholder="+91 98765 43210"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" /> State
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/50 focus:outline-none"
              >
                <option value="">Select State</option>
                {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium flex items-center gap-2">
                <Target className="w-4 h-4 text-muted-foreground" /> Target Exam
              </label>
              <select
                value={targetExam}
                onChange={(e) => setTargetExam(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/50 focus:outline-none"
              >
                <option value="">Select Target Exam</option>
                {TARGET_EXAMS.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving || uploading}
            className="btn-primary flex items-center gap-2"
          >
            {saving || uploading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> {uploading ? "Uploading..." : "Saving..."}</>
            ) : (
              <><Save className="w-4 h-4" /> Save Changes</>
            )}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
