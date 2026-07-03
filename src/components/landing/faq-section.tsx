"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Is TestNova really free to use?",
    a: "Yes! TestNova has a completely free tier with access to 100+ practice tests, basic analytics, and 5 full mock tests. No credit card required. You can upgrade to Pro or Annual plans for full access to all features.",
  },
  {
    q: "How is TestNova different from other platforms?",
    a: "TestNova uses the actual CBT interface technology used in government exams (SSC, Railway, Banking, etc.). Our AI-powered analytics identify your weak topics and create personalized study plans. We cover 200+ exams under one subscription with real exam-day simulation.",
  },
  {
    q: "Is there negative marking in mock tests?",
    a: "Yes! All our mock tests accurately replicate the negative marking scheme of the actual exam — 0.25, 0.33, or 0.50 marks deducted per wrong answer depending on the exam. You can also practice with negative marking disabled to build confidence.",
  },
  {
    q: "Can I access TestNova on my mobile phone?",
    a: "Absolutely! TestNova is a Progressive Web App (PWA) — install it on your phone like a native app. We also have a dedicated Android app available on the Play Store. The mobile experience is fully optimized for exam practice.",
  },
  {
    q: "How accurate are the mock tests compared to real exams?",
    a: "Our question bank is curated by subject matter experts with 10+ years of experience in government exam coaching. We analyze patterns from previous 5-10 years of actual exams and align our difficulty levels, topic distribution, and question types accordingly.",
  },
  {
    q: "What is the refund policy?",
    a: "We offer a 7-day money-back guarantee on all paid plans. If you're not satisfied with TestNova within 7 days of purchase, contact our support team and you'll receive a full refund — no questions asked.",
  },
  {
    q: "Can I use TestNova for multiple exams?",
    a: "Yes! One subscription covers all exam categories on TestNova. If you're preparing for SSC CGL and also keeping IBPS PO as a backup, you can practice both with the same account.",
  },
  {
    q: "How do I get my certificate?",
    a: "After completing a full mock test series and achieving the qualifying score, you'll automatically receive a downloadable certificate with your name, score, rank, and date. These certificates are great for coaching institute applications.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="section bg-background">
      <div className="container-xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="badge-primary mb-4 inline-block">FAQ</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to know about TestNova
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="card"
            >
              <button
                className="w-full flex items-center justify-between gap-4 text-left"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span className="font-semibold text-base">{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-300 ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence initial={false}>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p className="mt-4 text-muted-foreground text-sm leading-relaxed border-t border-border pt-4">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
