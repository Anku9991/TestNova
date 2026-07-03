"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Building2, Train, Landmark, Shield, GraduationCap, Stethoscope,
  Scale, Cpu, BookOpen, ChevronRight, Award,
} from "lucide-react";

const categories = [
  {
    id: "ssc",
    name: "SSC Exams",
    icon: Building2,
    color: "from-blue-500 to-blue-700",
    glow: "shadow-blue-500/20",
    count: "12+ Exams",
    exams: ["CGL", "CHSL", "MTS", "CPO", "GD Constable", "Delhi Police"],
    popular: true,
  },
  {
    id: "railway",
    name: "Railway (RRB)",
    icon: Train,
    color: "from-orange-500 to-red-600",
    glow: "shadow-orange-500/20",
    count: "8+ Exams",
    exams: ["NTPC", "Group D", "ALP", "JE", "RPF", "SI"],
    popular: true,
  },
  {
    id: "banking",
    name: "Banking",
    icon: Landmark,
    color: "from-green-500 to-emerald-700",
    glow: "shadow-green-500/20",
    count: "15+ Exams",
    exams: ["IBPS PO", "SBI PO", "RBI Grade B", "LIC AAO", "NABARD", "EPFO"],
    popular: true,
  },
  {
    id: "upsc",
    name: "UPSC & State PSC",
    icon: Award,
    color: "from-purple-500 to-violet-700",
    glow: "shadow-purple-500/20",
    count: "30+ Exams",
    exams: ["UPSC CSE", "BPSC", "UPPSC", "MPSC", "APPSC", "TNPSC"],
    popular: false,
  },
  {
    id: "defence",
    name: "Defence",
    icon: Shield,
    color: "from-red-500 to-rose-700",
    glow: "shadow-red-500/20",
    count: "10+ Exams",
    exams: ["NDA", "CDS", "CAPF", "Air Force", "Navy", "Army"],
    popular: false,
  },
  {
    id: "teaching",
    name: "Teaching",
    icon: GraduationCap,
    color: "from-yellow-500 to-amber-600",
    glow: "shadow-yellow-500/20",
    count: "12+ Exams",
    exams: ["CTET", "STET", "UGC NET", "TGT", "PGT", "KVS"],
    popular: false,
  },
  {
    id: "insurance",
    name: "Insurance",
    icon: Stethoscope,
    color: "from-teal-500 to-cyan-700",
    glow: "shadow-teal-500/20",
    count: "6+ Exams",
    exams: ["LIC ADO", "NICL AO", "GIC", "OIC", "UIIC", "NIACL"],
    popular: false,
  },
  {
    id: "judiciary",
    name: "Judiciary",
    icon: Scale,
    color: "from-indigo-500 to-indigo-700",
    glow: "shadow-indigo-500/20",
    count: "5+ Exams",
    exams: ["District Judge", "Civil Judge", "CLAT", "AILET", "Judicial Services"],
    popular: false,
  },
  {
    id: "engineering",
    name: "Engineering",
    icon: Cpu,
    color: "from-sky-500 to-sky-700",
    glow: "shadow-sky-500/20",
    count: "8+ Exams",
    exams: ["GATE", "ESE/IES", "SSC JE", "RRB JE", "BHEL", "ISRO"],
    popular: false,
  },
  {
    id: "medical",
    name: "Medical",
    icon: Stethoscope,
    color: "from-rose-500 to-pink-700",
    glow: "shadow-rose-500/20",
    count: "6+ Exams",
    exams: ["NEET PG", "AIIMS", "JIPMER", "PGI", "ESIC MO", "Railway Health"],
    popular: false,
  },
  {
    id: "police",
    name: "Police",
    icon: Shield,
    color: "from-slate-500 to-slate-700",
    glow: "shadow-slate-500/20",
    count: "20+ Exams",
    exams: ["State Police SI", "Constable", "Delhi Police", "UP Police", "Rajasthan Police"],
    popular: false,
  },
  {
    id: "other",
    name: "And Many More",
    icon: BookOpen,
    color: "from-primary-500 to-primary-800",
    glow: "shadow-primary-500/20",
    count: "200+ Exams",
    exams: ["IB ACIO", "DRDO", "ISRO", "NIA", "NTRO", "SPG"],
    popular: false,
  },
];

export function ExamCategories() {
  return (
    <section className="section bg-muted/30">
      <div className="container-xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="badge-primary mb-4 inline-block">200+ Exam Categories</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Every Exam, <span className="gradient-text">One Platform</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From SSC to UPSC, Railway to Banking — we cover every major government competitive
            exam with curated content and real exam simulations.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Link href={`/exams/${cat.id}`}>
                  <div
                    className={`group card cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${cat.popular ? "ring-2 ring-secondary-500/30" : ""}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-lg ${cat.glow} group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {cat.popular && (
                          <span className="badge-warning text-xs">Popular</span>
                        )}
                        <span className="text-xs text-muted-foreground">{cat.count}</span>
                      </div>
                    </div>

                    <h3 className="font-display font-bold text-lg mb-2 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors">
                      {cat.name}
                    </h3>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {cat.exams.slice(0, 3).map((exam) => (
                        <span
                          key={exam}
                          className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground"
                        >
                          {exam}
                        </span>
                      ))}
                      {cat.exams.length > 3 && (
                        <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                          +{cat.exams.length - 3} more
                        </span>
                      )}
                    </div>

                    <div className="flex items-center text-primary-500 dark:text-primary-400 text-sm font-semibold group-hover:gap-2 transition-all">
                      Explore Tests
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Link href="/exams" className="btn-outline inline-flex">
            View All Exam Categories
            <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
