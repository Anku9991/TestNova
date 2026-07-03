"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { getInitials } from "@/lib/utils";

const testimonials = [
  {
    name: "Rajesh Kumar",
    role: "SSC CGL Selected",
    location: "Bihar",
    avatar: "",
    rating: 5,
    text: "ExamNexa is hands down the best platform for SSC preparation. The real CBT interface gave me complete confidence on exam day. The AI analysis helped me identify my weak areas in Quant and Grammar. Selected in first attempt!",
    exam: "SSC CGL 2024 — Tier 1 & 2 Cleared",
    score: "189/200",
  },
  {
    name: "Priya Sharma",
    role: "Bank PO Selected",
    location: "Rajasthan",
    avatar: "",
    rating: 5,
    text: "After failing 3 times, I found ExamNexa. The detailed analytics showed me exactly where I was losing marks. The reasoning section coverage is exceptional. Finally selected as IBPS PO in 4th attempt!",
    exam: "IBPS PO 2024 — Final Selected",
    score: "91st Percentile",
  },
  {
    name: "Amit Singh",
    role: "Railway Employee",
    location: "UP",
    avatar: "",
    rating: 5,
    text: "Best value for money! The RRB NTPC mock tests are exactly like the real exam. I practiced 150+ tests here. The timer, question palette, and negative marking practice was spot on. Thank you ExamNexa!",
    exam: "RRB NTPC 2024 — Junior Clerk",
    score: "CBI Rank 1247",
  },
  {
    name: "Sneha Patel",
    role: "UPSC Aspirant",
    location: "Gujarat",
    avatar: "",
    rating: 5,
    text: "The UPSC Prelims practice on ExamNexa is brilliant. The previous year question analysis and topic-wise tests are very systematic. The AI study planner helped me complete the entire syllabus in 6 months.",
    exam: "UPSC CSE Prelims 2024 — Cleared",
    score: "GS Paper: 124/200",
  },
  {
    name: "Mohammed Irfan",
    role: "NDA Officer Cadet",
    location: "Hyderabad",
    avatar: "",
    rating: 5,
    text: "ExamNexa's NDA mock tests are incredibly accurate. The Maths section with LaTeX rendering for formulas is a game-changer. Cleared NDA in my very first attempt at 18! The leaderboard kept me motivated.",
    exam: "NDA 2024 — 143rd Course",
    score: "Maths: 168/300",
  },
  {
    name: "Kavitha Nair",
    role: "LIC Assistant",
    location: "Kerala",
    avatar: "",
    rating: 5,
    text: "The insurance exam coverage on ExamNexa is unmatched. LIC AAO, NICL, NIACL — all fully covered. The PDF reports helped me track my progress week by week. Highly recommended for insurance aspirants!",
    exam: "LIC Assistant 2024 — Selected",
    score: "Score: 97/100",
  },
];

export function TestimonialsSection() {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c === 0 ? testimonials.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === testimonials.length - 1 ? 0 : c + 1));

  return (
    <section className="section bg-muted/30">
      <div className="container-xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="badge-primary mb-4 inline-block">Success Stories</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Real Results from <span className="gradient-text">Real Aspirants</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Join 10L+ students who cracked their dream government jobs with ExamNexa
          </p>
        </motion.div>

        {/* Mobile: cards grid, Desktop: featured carousel */}
        <div className="hidden md:block">
          <div className="relative max-w-4xl mx-auto">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="card p-8 md:p-10"
            >
              <Quote className="w-10 h-10 text-primary-500/30 mb-6" />
              <p className="text-lg md:text-xl text-foreground/80 leading-relaxed mb-8 italic">
                &ldquo;{testimonials[current].text}&rdquo;
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-800 flex items-center justify-center text-white font-bold text-lg">
                    {getInitials(testimonials[current].name)}
                  </div>
                  <div>
                    <div className="font-bold text-base">{testimonials[current].name}</div>
                    <div className="text-muted-foreground text-sm">{testimonials[current].role} · {testimonials[current].location}</div>
                    <div className="flex mt-1">
                      {Array.from({ length: testimonials[current].rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-secondary-400 text-secondary-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-primary-500 dark:text-primary-400">{testimonials[current].exam}</div>
                  <div className="text-2xl font-display font-extrabold text-secondary-500">{testimonials[current].score}</div>
                </div>
              </div>
            </motion.div>

            <div className="flex items-center justify-center gap-4 mt-6">
              <button onClick={prev} className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${i === current ? "bg-primary-500 w-6" : "bg-border"}`}
                  />
                ))}
              </div>
              <button onClick={next} className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden grid grid-cols-1 gap-4">
          {testimonials.slice(0, 3).map((t) => (
            <div key={t.name} className="card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-800 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {getInitials(t.name)}
                </div>
                <div>
                  <div className="font-bold text-sm">{t.name}</div>
                  <div className="text-muted-foreground text-xs">{t.role}</div>
                </div>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">&ldquo;{t.text.slice(0, 150)}...&rdquo;</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
