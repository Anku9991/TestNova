"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Play, Star, CheckCircle, Sparkles } from "lucide-react";

const examTags = [
  "SSC CGL", "SSC CHSL", "SSC MTS", "SSC CPO", "Delhi Police",
  "RRB NTPC", "RRB Group D", "IBPS PO", "SBI PO", "RBI Grade B",
  "UPSC CSE", "State PSC", "LIC AAO", "NABARD", "EPFO",
  "NDA", "CDS", "CTET", "SSC GD", "Bank Clerk",
];

const stats = [
  { value: "10L+", label: "Students Enrolled" },
  { value: "50K+", label: "Questions Available" },
  { value: "500+", label: "Mock Tests" },
  { value: "98%", label: "Selection Rate" },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-hero-gradient">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 w-96 h-96 bg-primary-600/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary-600/10 rounded-full blur-3xl"
        />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative z-10 container-xl py-32 md:py-40">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/20 text-sm text-white/80 mb-8"
          >
            <Sparkles className="w-4 h-4 text-secondary-400" />
            <span>India&apos;s #1 Government Exam Preparation Platform</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.05] mb-6"
          >
            Crack Any
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-secondary-400 via-secondary-300 to-secondary-500">
              Government Exam
            </span>
            with Confidence
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-white/60 max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            Practice with real CBT interface, AI-powered analytics, and 50,000+ curated questions
            for SSC, Railway, Banking, UPSC, Defence, and 200+ more competitive exams.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <Link
              href="/register"
              className="group flex items-center gap-2 px-8 py-4 rounded-2xl bg-secondary-500 hover:bg-secondary-400 text-primary-900 font-bold text-lg transition-all duration-300 hover:shadow-glow-gold hover:scale-[1.03] active:scale-[0.98]"
            >
              Start Free — No Credit Card
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="group flex items-center gap-3 px-8 py-4 rounded-2xl glass border border-white/20 text-white font-semibold text-lg hover:bg-white/10 transition-all duration-300">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 group-hover:bg-white/20 transition-colors">
                <Play className="w-4 h-4 ml-0.5" />
              </span>
              Watch Demo
            </button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 text-white/50 text-sm mb-16"
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full border-2 border-white/20 bg-gradient-to-br from-primary-500 to-primary-800 flex items-center justify-center text-xs text-white font-bold"
                  >
                    {["A", "R", "S", "P", "M"][i - 1]}
                  </div>
                ))}
              </div>
              <span>10L+ students trust us</span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-4 h-4 fill-secondary-400 text-secondary-400" />
              ))}
              <span className="ml-1">4.9/5 rating</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>100% Money Back Guarantee</span>
            </div>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
                className="glass-card py-6 px-4 rounded-2xl text-center"
              >
                <div className="font-display text-3xl md:text-4xl font-bold text-secondary-400 mb-1">
                  {stat.value}
                </div>
                <div className="text-white/50 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Exam Tags Marquee */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="relative overflow-hidden"
          >
            <div className="flex items-center gap-3 animate-[marquee_30s_linear_infinite] whitespace-nowrap">
              {[...examTags, ...examTags].map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center px-4 py-2 rounded-xl glass border border-white/10 text-white/60 text-sm font-medium hover:border-secondary-500/50 hover:text-white transition-colors cursor-default flex-shrink-0"
                >
                  {tag}
                </span>
              ))}
            </div>
            {/* Fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#0a0e27] to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#0a0e27] to-transparent pointer-events-none" />
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
