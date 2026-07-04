"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, BrainCircuit, Target, CheckCircle, TrendingUp, AlertTriangle, Loader2, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

import { db } from "@/lib/firebase/config";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";

interface AIAnalysis {
  overallAssessment: string;
  strengths: string[];
  weaknesses: string[];
  studyPlan: { day: string; focus: string; action: string }[];
  tips: string[];
}

export default function AIPlannerPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);

  const generateAnalysis = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Fetch user's latest result
      const q = query(
        collection(db, "results"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc"),
        limit(1)
      );
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        toast.error("You need to take at least one exam before generating a study plan!");
        setLoading(false);
        return;
      }
      
      const latestResult = snapshot.docs[0].data();

      // 2. Send real data to AI
      const token = await user.getIdToken();
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ resultsData: latestResult })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate analysis");
      
      setAnalysis(data);
      toast.success("AI Analysis generated successfully!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center justify-center p-3 bg-primary-500/10 rounded-full mb-4">
          <BrainCircuit className="w-8 h-8 text-primary-500" />
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
          AI-Powered Study Planner
        </h1>
        <p className="text-muted-foreground">
          Let Gemini AI analyze your performance patterns and create a personalized learning roadmap to maximize your score.
        </p>
      </motion.div>

      {/* Generate Button state */}
      {!analysis && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center mt-12">
          <button 
            onClick={generateAnalysis} 
            disabled={loading}
            className="btn-primary py-4 px-8 text-lg rounded-2xl shadow-glow group disabled:opacity-70 flex items-center gap-3"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Analyzing Performance...
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6 group-hover:scale-110 transition-transform" />
                Generate My Personalized Plan
              </>
            )}
          </button>
        </motion.div>
      )}

      {/* Results Display */}
      {analysis && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Assessment */}
          <div className="card bg-gradient-to-br from-primary-500/10 to-transparent border-primary-500/30">
            <h3 className="font-display font-bold text-xl mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary-500" /> Overall Assessment
            </h3>
            <p className="text-foreground leading-relaxed">{analysis.overallAssessment}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="card bg-emerald-500/5 border-emerald-500/20">
              <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-5 h-5" /> Your Strengths
              </h3>
              <ul className="space-y-3">
                {analysis.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="card bg-red-500/5 border-red-500/20">
              <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="w-5 h-5" /> Areas to Improve
              </h3>
              <ul className="space-y-3">
                {analysis.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actionable Study Plan */}
          <h3 className="font-display font-bold text-2xl mt-8 mb-4">3-Day Action Plan</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {analysis.studyPlan.map((plan, i) => (
              <div key={i} className="card relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary-500/10 rounded-bl-full -z-10" />
                <h4 className="font-bold text-lg text-primary-500 mb-1">{plan.day}</h4>
                <p className="text-sm font-medium mb-3">{plan.focus}</p>
                <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground">
                  {plan.action}
                </div>
              </div>
            ))}
          </div>

          {/* Tips */}
          <div className="card mt-6">
            <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" /> Pro Tips
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {analysis.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground p-3 rounded-lg border border-border bg-muted/30">
                  <span className="font-bold text-primary-500">{i+1}.</span> {tip}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex justify-center mt-8">
            <button onClick={() => setAnalysis(null)} className="btn-ghost">
              Start Over
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
