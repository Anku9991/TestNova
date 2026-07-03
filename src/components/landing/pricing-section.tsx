"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Check, Zap, Crown, Star } from "lucide-react";

const plans = [
  {
    id: "free",
    name: "Free",
    icon: Zap,
    price: 0,
    originalPrice: null,
    duration: "Forever",
    description: "Perfect for getting started with exam prep",
    features: [
      "100+ Free Practice Tests",
      "Basic Performance Analytics",
      "5 Subject Mock Tests",
      "Community Forum Access",
      "Mobile App Access",
      "Email Support",
    ],
    notIncluded: [
      "Full Test Series Access",
      "AI Performance Analysis",
      "PDF Reports",
      "Live Tests",
    ],
    cta: "Get Started Free",
    href: "/register",
    popular: false,
    color: "border-border",
  },
  {
    id: "pro",
    name: "Pro",
    icon: Star,
    price: 499,
    originalPrice: 999,
    duration: "per month",
    description: "Most popular for serious aspirants",
    features: [
      "500+ Full Mock Test Series",
      "All Exam Categories",
      "AI Performance Analysis",
      "Detailed PDF Reports",
      "Live Tests & Rankings",
      "Negative Marking Practice",
      "Topic-wise Analysis",
      "Previous Year Papers",
      "Priority Email Support",
      "Certificate on Completion",
      "Offline Mode (PWA)",
      "Ad-Free Experience",
    ],
    notIncluded: [],
    cta: "Start Pro Trial",
    href: "/register?plan=pro",
    popular: true,
    color: "border-primary-500",
  },
  {
    id: "annual",
    name: "Annual",
    icon: Crown,
    price: 2999,
    originalPrice: 5988,
    duration: "per year",
    description: "Best value — save 50% with annual plan",
    features: [
      "Everything in Pro",
      "Unlimited Mock Tests",
      "1-on-1 Mentorship (2 sessions)",
      "Study Planner & Daily Targets",
      "WhatsApp Support",
      "Interview Preparation",
      "Personality Tests",
      "Early Access to New Features",
      "Free Android App",
      "Group Discussion Practice",
      "Expert Video Solutions",
      "GST Invoice for Tax Benefits",
    ],
    notIncluded: [],
    cta: "Get Annual Plan",
    href: "/register?plan=annual",
    popular: false,
    color: "border-secondary-500",
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="section bg-background">
      <div className="container-xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="badge-primary mb-4 inline-block">Transparent Pricing</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Simple, Affordable <span className="gradient-text">Plans</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            No hidden fees. Cancel anytime. 7-day money-back guarantee on all paid plans.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative card border-2 ${plan.color} ${
                  plan.popular ? "shadow-glow scale-[1.02] md:scale-105" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="badge bg-primary-600 text-white px-4 py-1 text-xs font-bold">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                {plan.id === "annual" && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="badge bg-secondary-500 text-primary-900 px-4 py-1 text-xs font-bold">
                      BEST VALUE 🔥
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      plan.popular
                        ? "bg-primary-600 text-white"
                        : plan.id === "annual"
                        ? "bg-secondary-500 text-primary-900"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg">{plan.name}</h3>
                    <p className="text-muted-foreground text-xs">{plan.description}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-4xl font-extrabold">
                      {plan.price === 0 ? "Free" : `₹${plan.price}`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-muted-foreground text-sm">{plan.duration}</span>
                    )}
                  </div>
                  {plan.originalPrice && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-muted-foreground line-through text-sm">
                        ₹{plan.originalPrice}
                      </span>
                      <span className="badge-success text-xs">
                        Save {Math.round((1 - plan.price / plan.originalPrice) * 100)}%
                      </span>
                    </div>
                  )}
                </div>

                <Link
                  href={plan.href}
                  className={`w-full text-center block py-3 rounded-xl font-semibold text-sm transition-all duration-200 mb-6 ${
                    plan.popular
                      ? "btn-primary"
                      : plan.id === "annual"
                      ? "btn-secondary"
                      : "btn-outline"
                  }`}
                >
                  {plan.cta}
                </Link>

                <ul className="space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-muted-foreground text-sm mt-10"
        >
          All plans include GST-ready invoices. Need a custom plan for institutions?{" "}
          <Link href="/contact" className="text-primary-500 hover:underline">
            Contact Sales →
          </Link>
        </motion.p>
      </div>
    </section>
  );
}
