"use client";

import { motion } from "framer-motion";
import { UserPlus, Search, ClipboardList, BarChart2 } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: UserPlus,
    title: "Create Free Account",
    description:
      "Sign up in 30 seconds with your email or Google. No credit card required. Access 100+ free tests instantly.",
    color: "from-blue-500 to-primary-600",
  },
  {
    step: "02",
    icon: Search,
    title: "Choose Your Exam",
    description:
      "Browse 200+ exam categories. Filter by exam type, difficulty, and subject. Find exactly what you need.",
    color: "from-purple-500 to-violet-600",
  },
  {
    step: "03",
    icon: ClipboardList,
    title: "Take the Test",
    description:
      "Experience the real CBT interface. Timer, question palette, negative marking — just like the actual exam.",
    color: "from-orange-500 to-red-500",
  },
  {
    step: "04",
    icon: BarChart2,
    title: "Analyze & Improve",
    description:
      "Get instant detailed analysis. AI identifies your weak areas and creates a personalized improvement plan.",
    color: "from-green-500 to-emerald-600",
  },
];

export function HowItWorks() {
  return (
    <section className="section bg-muted/30">
      <div className="container-xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="badge-primary mb-4 inline-block">Simple Process</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Start Preparing in <span className="gradient-text">4 Easy Steps</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Getting started is incredibly simple. From registration to your first mock test in under 5 minutes.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connecting line on desktop */}
          <div className="hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 via-orange-500 to-green-500 opacity-20" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="relative mb-6">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-background border-2 border-border flex items-center justify-center">
                      <span className="text-xs font-bold text-muted-foreground">{step.step}</span>
                    </div>
                  </div>
                  <h3 className="font-display font-bold text-lg mb-3">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
