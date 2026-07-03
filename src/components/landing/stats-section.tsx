"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const stats = [
  { value: 1000000, suffix: "+", label: "Students Enrolled", prefix: "" },
  { value: 50000, suffix: "+", label: "Practice Questions", prefix: "" },
  { value: 500, suffix: "+", label: "Mock Tests", prefix: "" },
  { value: 98, suffix: "%", label: "Success Rate", prefix: "" },
  { value: 200, suffix: "+", label: "Exams Covered", prefix: "" },
  { value: 15, suffix: "+", label: "Years of Excellence", prefix: "" },
];

function CountUp({ target, suffix, prefix }: { target: number; suffix: string; prefix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const steps = 60;
    const step = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, target]);

  const formatted =
    target >= 1000000
      ? `${(count / 1000000).toFixed(1)}L`
      : target >= 1000
      ? `${(count / 1000).toFixed(0)}K`
      : count;

  return (
    <span ref={ref}>
      {prefix}{formatted}{suffix}
    </span>
  );
}

export function StatsSection() {
  return (
    <section className="section bg-background">
      <div className="container-xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Trusted by <span className="gradient-text">Lakhs of Aspirants</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Join India&apos;s fastest growing government exam preparation platform
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="card text-center group hover:border-primary-500/30 hover:shadow-glow/20"
            >
              <div className="font-display text-3xl md:text-4xl font-extrabold text-primary-600 dark:text-primary-400 mb-2">
                <CountUp target={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
              </div>
              <div className="text-muted-foreground text-xs font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
