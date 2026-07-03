"use client";

import { motion } from "framer-motion";
import {
  Brain, Timer, BarChart3, Shield, Download, Smartphone,
  Zap, BookMarked, Trophy, Users, Target, RefreshCw,
} from "lucide-react";

const features = [
  {
    icon: Timer,
    title: "Real CBT Experience",
    description:
      "Full-screen exam interface that mirrors actual government exam software — question palette, timer, review later, and auto-submit.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: Brain,
    title: "AI Performance Analysis",
    description:
      "Our AI analyzes your attempts to identify weak topics, predict your score, and create a personalized study plan.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    icon: BarChart3,
    title: "Detailed Analytics",
    description:
      "Topic-wise, time-wise, and difficulty-wise breakdown. Compare with toppers and track your progress over time.",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    icon: BookMarked,
    title: "50,000+ Questions",
    description:
      "Massive question bank with PYQs, difficulty-tagged MCQs, comprehension passages, and math formulae with LaTeX rendering.",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    icon: Trophy,
    title: "Live Leaderboard",
    description:
      "Compete with thousands of aspirants in real-time. Track your national and state rank after every test.",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
  {
    icon: Download,
    title: "PDF Reports & Certificates",
    description:
      "Download detailed performance reports and achievement certificates to share with employers and coaching institutes.",
    color: "text-teal-500",
    bg: "bg-teal-500/10",
  },
  {
    icon: Shield,
    title: "Exam Security",
    description:
      "Advanced violation detection — tab-switch monitoring, fullscreen enforcement, and auto-submit on suspicious activity.",
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
  {
    icon: Smartphone,
    title: "PWA + Mobile App",
    description:
      "Install TestNova as a PWA or download the Android app. Study offline, get push notifications, and sync seamlessly.",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
  {
    icon: RefreshCw,
    title: "Auto-Save & Sync",
    description:
      "Never lose your progress. Answers are auto-saved every second and synced across devices in real-time.",
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
  },
  {
    icon: Target,
    title: "Daily Targets",
    description:
      "AI-generated daily study goals, question targets, and motivational streaks to keep you on track.",
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description:
      "Get your score, rank, and detailed question-by-question analysis within seconds of submitting your test.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    icon: Users,
    title: "Community & Support",
    description:
      "24/7 support, discussion forums, expert mentors, and a thriving community of government exam aspirants.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
];

export function FeaturesSection() {
  return (
    <section className="section bg-background">
      <div className="container-xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="badge-primary mb-4 inline-block">Why TestNova?</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Everything You Need to <span className="gradient-text">Succeed</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            We&apos;ve built the most complete exam preparation ecosystem with features that
            actually make a difference to your score.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="card group hover:border-primary-500/20 hover:-translate-y-1 transition-all duration-300"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="font-display font-bold text-base mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
