"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Loader2, Send } from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setIsSubmitting(true);
    // Simulate sending message
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Thank you! Your message has been received. We will respond shortly.");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    }, 1500);
  };

  return (
    <div className="min-h-screen py-32 px-4 max-w-6xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-white">Contact Us</h1>
        <p className="text-muted-foreground text-lg">
          Have questions about your subscription, mock tests, or custom business packages? Feel free to reach out to us!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left Side: Contact Information Cards */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white mb-4">Official Contact Details</h2>

          <div className="card bg-white/5 border border-white/10 hover:border-primary-500/30 transition-all p-6 flex items-start gap-4 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Our Address</h3>
              <p className="text-muted-foreground mt-1">
                PihNexa Technologies (Operating TestNova)<br />
                Lucknow, Uttar Pradesh, India
              </p>
            </div>
          </div>

          <div className="card bg-white/5 border border-white/10 hover:border-primary-500/30 transition-all p-6 flex items-start gap-4 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center flex-shrink-0">
              <Phone className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Phone Number</h3>
              <p className="text-muted-foreground mt-1 hover:text-white transition-colors">
                <a href="tel:+917992203671">+91 7992203671</a>
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">Available Mon-Sat, 9:00 AM - 6:00 PM IST</p>
            </div>
          </div>

          <div className="card bg-white/5 border border-white/10 hover:border-primary-500/30 transition-all p-6 flex items-start gap-4 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center flex-shrink-0">
              <Mail className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Email Address</h3>
              <p className="text-muted-foreground mt-1 hover:text-white transition-colors">
                <a href="mailto:info@pihnexa.co.in">info@pihnexa.co.in</a>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Message Form */}
        <div className="card bg-white/5 border border-white/10 p-8 rounded-3xl space-y-6">
          <h2 className="text-2xl font-bold text-white">Send Us a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Your Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:border-primary-500 focus:outline-none transition-colors"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:border-primary-500 focus:outline-none transition-colors"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:border-primary-500 focus:outline-none transition-colors"
                placeholder="Topic of inquiry"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Message *</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:border-primary-500 focus:outline-none transition-colors resize-none"
                placeholder="Type your message details here..."
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold transition-all duration-200 disabled:opacity-60 mt-4"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" /> Send Inquiry
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
