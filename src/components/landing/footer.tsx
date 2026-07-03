"use client";

import Link from "next/link";
import { Zap, Twitter, Youtube, Instagram, Facebook, Mail, Phone, MapPin } from "lucide-react";

const footerLinks = {
  "Exam Categories": [
    { label: "SSC Exams", href: "/exams/ssc" },
    { label: "Railway (RRB)", href: "/exams/railway" },
    { label: "Banking", href: "/exams/banking" },
    { label: "UPSC & PSC", href: "/exams/upsc" },
    { label: "Defence", href: "/exams/defence" },
    { label: "Teaching", href: "/exams/teaching" },
  ],
  "Platform": [
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Blog", href: "/blog" },
    { label: "Success Stories", href: "/testimonials" },
    { label: "Free Tests", href: "/exams" },
    { label: "Download App", href: "/app" },
  ],
  "Company": [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
    { label: "Press Kit", href: "/press" },
    { label: "Partner with Us", href: "/partners" },
    { label: "Advertise", href: "/advertise" },
  ],
  "Support": [
    { label: "Help Center", href: "/help" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Refund Policy", href: "/refund" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "Accessibility", href: "/accessibility" },
  ],
};

const socials = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Youtube, href: "#", label: "YouTube" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Facebook, href: "#", label: "Facebook" },
];

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="container-xl py-16">
        {/* Top row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-primary-900 flex items-center justify-center">
                <Zap className="w-5 h-5 text-secondary-400" />
              </div>
              <span className="font-display font-bold text-xl">
                Exam<span className="text-primary-500">Nexa</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              India&apos;s most advanced government competitive exam preparation platform.
              Premium CBT experience for SSC, Railway, Banking, UPSC & 200+ exams.
            </p>
            <div className="flex gap-3">
              {socials.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-primary-500/10 hover:text-primary-500 transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-display font-bold text-sm mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground text-sm hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact info */}
        <div className="flex flex-wrap gap-6 pb-8 border-b border-border text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary-500" />
            support@examnexa.com
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-primary-500" />
            +91 98765 43210
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary-500" />
            New Delhi, India — 110001
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} ExamNexa. All rights reserved. Built with ❤️ in India.</p>
          <p>
            Made for aspirants who dare to dream of serving the nation.
          </p>
        </div>
      </div>
    </footer>
  );
}
