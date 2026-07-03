"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Zap, Mail, Lock, User, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { registerWithEmail, loginWithGoogle } from "@/lib/firebase/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  targetExam: z.string().optional(),
  agreeToTerms: z.boolean().refine((v) => v, "You must agree to the terms"),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
type FormData = z.infer<typeof schema>;

const examOptions = [
  "SSC CGL", "SSC CHSL", "SSC MTS", "SSC CPO",
  "RRB NTPC", "RRB Group D", "RRB ALP",
  "IBPS PO", "IBPS Clerk", "SBI PO", "SBI Clerk",
  "UPSC CSE", "State PSC",
  "NDA/CDS", "Delhi Police", "LIC AAO", "Other",
];

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await registerWithEmail(data.email, data.password, data.name, "student");
      toast.success("Account created! Welcome to TestNova 🎉");
      router.push("/student/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "";
      if (message.includes("email-already-in-use")) {
        toast.error("This email is already registered. Please sign in.");
      } else {
        toast.error("Registration failed. Please try again.");
      }
    }
  };

  const handleGoogleRegister = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      toast.success("Welcome to TestNova! 🎉");
      router.push("/student/dashboard");
    } catch {
      toast.error("Google signup failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card p-8"
    >
      <div className="text-center mb-6">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-primary-900 flex items-center justify-center">
            <Zap className="w-5 h-5 text-secondary-400" />
          </div>
          <span className="font-display font-bold text-xl text-white">
            Exam<span className="text-primary-400">Nexa</span>
          </span>
        </Link>
        <h1 className="font-display text-2xl font-bold text-white mb-1">Create your account</h1>
        <p className="text-white/50 text-sm">Start your free exam preparation journey</p>
      </div>

      <button
        onClick={handleGoogleRegister}
        disabled={googleLoading}
        id="google-register-btn"
        className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium transition-all duration-200 mb-5 disabled:opacity-60"
      >
        {googleLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
        )}
        Continue with Google
      </button>

      <div className="relative mb-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-transparent text-white/40">or register with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        <div>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              {...register("name")}
              placeholder="Full Name"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary-500/50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-white placeholder:text-white/20 transition-all text-sm"
              id="name-input"
            />
          </div>
          {errors.name && <p className="mt-1 text-red-400 text-xs">{errors.name.message}</p>}
        </div>

        <div>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              {...register("email")}
              type="email"
              placeholder="Email Address"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary-500/50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-white placeholder:text-white/20 transition-all text-sm"
              id="register-email-input"
            />
          </div>
          {errors.email && <p className="mt-1 text-red-400 text-xs">{errors.email.message}</p>}
        </div>

        <div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="Password (min 8 chars)"
              className="w-full pl-10 pr-12 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary-500/50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-white placeholder:text-white/20 transition-all text-sm"
              id="register-password-input"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-red-400 text-xs">{errors.password.message}</p>}
        </div>

        <div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              {...register("confirmPassword")}
              type="password"
              placeholder="Confirm Password"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary-500/50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-white placeholder:text-white/20 transition-all text-sm"
              id="confirm-password-input"
            />
          </div>
          {errors.confirmPassword && <p className="mt-1 text-red-400 text-xs">{errors.confirmPassword.message}</p>}
        </div>

        <div>
          <div className="relative">
            <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <select
              {...register("targetExam")}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary-500/50 focus:outline-none text-white/60 transition-all text-sm appearance-none"
              id="target-exam-select"
            >
              <option value="" className="bg-gray-900">Target Exam (optional)</option>
              {examOptions.map((e) => (
                <option key={e} value={e} className="bg-gray-900">{e}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <input
            {...register("agreeToTerms")}
            type="checkbox"
            id="terms-checkbox"
            className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5"
          />
          <label htmlFor="terms-checkbox" className="text-white/50 text-xs leading-relaxed">
            I agree to TestNova&apos;s{" "}
            <Link href="/terms" className="text-primary-400 hover:underline">Terms of Service</Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary-400 hover:underline">Privacy Policy</Link>
          </label>
        </div>
        {errors.agreeToTerms && <p className="text-red-400 text-xs">{errors.agreeToTerms.message}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          id="register-submit-btn"
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold transition-all duration-200 hover:shadow-glow disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Free Account"}
        </button>
      </form>

      <p className="text-center text-white/40 text-sm mt-5">
        Already have an account?{" "}
        <Link href="/login" className="text-primary-400 hover:text-primary-300 font-semibold">
          Sign in →
        </Link>
      </p>
    </motion.div>
  );
}
