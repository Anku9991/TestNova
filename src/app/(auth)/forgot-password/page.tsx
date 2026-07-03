"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Mail, Loader2, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { resetPassword } from "@/lib/firebase/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
      toast.success("Password reset email sent!");
    } catch {
      toast.error("Failed to send reset email. Check if the email is registered.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-8"
    >
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-primary-900 flex items-center justify-center">
            <Zap className="w-5 h-5 text-secondary-400" />
          </div>
          <span className="font-display font-bold text-xl text-white">TestNova</span>
        </Link>
        <h1 className="font-display text-2xl font-bold text-white mb-1">Forgot Password?</h1>
        <p className="text-white/50 text-sm">Enter your email and we&apos;ll send you a reset link</p>
      </div>

      {sent ? (
        <div className="text-center py-6">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="font-bold text-white text-lg mb-2">Email Sent!</h2>
          <p className="text-white/50 text-sm mb-6">
            Check your inbox at <strong className="text-white">{email}</strong> for the password reset link.
          </p>
          <Link href="/login" className="btn-primary w-full justify-center text-sm">
            Back to Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary-500/50 focus:outline-none text-white placeholder:text-white/20 transition-all"
                id="reset-email-input"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !email}
            id="reset-submit-btn"
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold transition-all duration-200 disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Link"}
          </button>
          <Link href="/login" className="block text-center text-white/40 text-sm hover:text-white/70 transition-colors">
            ← Back to Sign In
          </Link>
        </form>
      )}
    </motion.div>
  );
}
