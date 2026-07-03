"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function CtaSection() {
  return (
    <section className="section bg-hero-gradient">
      <div className="container-xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/20 text-white/80 text-sm mb-8">
            <Sparkles className="w-4 h-4 text-secondary-400" />
            Start your preparation today — No credit card needed
          </div>

          <h2 className="font-display text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Your Dream Government Job
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary-300 to-secondary-500">
              Is Just One Step Away
            </span>
          </h2>

          <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Join 10 lakh+ aspirants who are preparing smarter with ExamNexa.
            Start free, upgrade when ready.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="group flex items-center gap-2 px-8 py-4 rounded-2xl bg-secondary-500 hover:bg-secondary-400 text-primary-900 font-bold text-lg transition-all duration-300 hover:shadow-glow-gold hover:scale-[1.03]"
            >
              Create Free Account
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl glass border border-white/20 text-white font-semibold text-lg hover:bg-white/10 transition-all duration-300"
            >
              Already have an account? Sign In
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
