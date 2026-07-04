"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Clock, Flag, ChevronLeft, ChevronRight, Maximize2, Minimize2,
  AlertTriangle, CheckCircle, LayoutGrid, X, Send, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { formatTime } from "@/lib/utils";

// --- Types ---
interface Option {
  id: string;
  text: string;
}
interface Question {
  id: string;
  number: number;
  text: string;
  options: Option[];
  marks: number;
  negativeMarks: number;
  correctAnswer?: string;
}
type QuestionStatus = "unvisited" | "visited" | "answered" | "marked" | "answered_marked";

// --- Sample questions ---
const sampleQuestions: Question[] = Array.from({ length: 25 }, (_, i) => ({
  id: `q${i + 1}`,
  number: i + 1,
  text: i === 0
    ? "In the following question, select the odd word pair from the given alternatives. (A) Doctor — Patient (B) Lawyer — Client (C) Teacher — Student (D) Plumber — Customer"
    : i === 1
    ? "If BOOK is coded as 25, then PENCIL will be coded as ?"
    : `Which of the following is the correct answer for Question ${i + 1}? This is a sample question to demonstrate the CBT interface.`,
  options: [
    { id: "A", text: i === 0 ? "Doctor — Patient" : `Option A for Q${i + 1}` },
    { id: "B", text: i === 0 ? "Lawyer — Client" : `Option B for Q${i + 1}` },
    { id: "C", text: i === 0 ? "Teacher — Student" : `Option C for Q${i + 1}` },
    { id: "D", text: i === 0 ? "Plumber — Customer" : `Option D for Q${i + 1}` },
  ],
  marks: 2,
  negativeMarks: 0.5,
}));

interface CBTEngineProps {
  examId: string;
  totalDurationMinutes?: number;
}

export function CBTEngine({ examId, totalDurationMinutes = 60 }: CBTEngineProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [examDoc, setExamDoc] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [statuses, setStatuses] = useState<Record<string, QuestionStatus>>({});
  const [timeLeft, setTimeLeft] = useState(totalDurationMinutes * 60);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPalette, setShowPalette] = useState(true);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [violations, setViolations] = useState(0);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadExamData() {
      try {
        const { db } = await import("@/lib/firebase/config");
        const { doc, getDoc, collection, query, limit, getDocs } = await import("firebase/firestore");
        
        // 1. Fetch Exam details (to get duration and rules)
        const eDoc = await getDoc(doc(db, "exams", examId));
        if (eDoc.exists()) {
          setExamDoc(eDoc.data());
          setTimeLeft((eDoc.data().duration || 60) * 60);
        }

        // 2. Fetch Questions (limit to 100 for now, in real app use examId filter)
        const qSnap = await getDocs(query(collection(db, "questions"), limit(eDoc.exists() ? eDoc.data().totalQuestions : 100)));
        const qData = qSnap.docs.map((d, i) => ({
          id: d.id,
          number: i + 1,
          ...d.data()
        } as Question));
        
        setQuestions(qData);
        
        // Init statuses
        const init: Record<string, QuestionStatus> = {};
        qData.forEach((q) => (init[q.id] = "unvisited"));
        setStatuses(init);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load CBT data:", err);
        toast.error("Failed to load exam data.");
      }
    }
    loadExamData();
  }, [examId]);

  const currentQuestion = questions[currentIndex];

  // Declare handleSubmit early so the timer useEffect can reference it
  const handleSubmit = useCallback(async () => {
    setExamSubmitted(true);
    setShowSubmitConfirm(false);
    toast.info("Exam submitted! Processing your results...", { duration: 4000 });
    
    try {
      const { db } = await import("@/lib/firebase/config");
      const { collection, addDoc, serverTimestamp } = await import("firebase/firestore");
      const { getAuth } = await import("firebase/auth");
      const user = getAuth().currentUser;

      if (!user) {
        toast.error("You must be logged in to save results.");
        return;
      }

      // Calculate score
      let correct = 0;
      let incorrect = 0;
      let score = 0;
      
      questions.forEach((q) => {
        const userAnswer = responses[q.id];
        if (userAnswer) {
          if (userAnswer === q.correctAnswer) {
            correct++;
            score += (q.marks || 1);
          } else {
            incorrect++;
            score -= (q.negativeMarks || 0);
          }
        }
      });

      const totalMarks = questions.reduce((acc, q) => acc + (q.marks || 1), 0);
      const percentage = (score / totalMarks) * 100;

      const resultRef = await addDoc(collection(db, "results"), {
        userId: user.uid,
        examId: examId,
        score: score,
        totalMarks: totalMarks,
        percentage: percentage,
        correctAnswers: correct,
        incorrectAnswers: incorrect,
        skippedAnswers: questions.length - (correct + incorrect),
        timeTaken: (examDoc?.duration || 60) * 60 - timeLeft,
        responses: responses,
        createdAt: serverTimestamp()
      });

      window.location.href = `/student/results/${resultRef.id}`;
    } catch (err) {
      console.error("Error saving result:", err);
      toast.error("Failed to save result!");
    }
  }, [responses, questions, examId, examDoc, timeLeft]);


  // Timer
  useEffect(() => {
    if (examSubmitted) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [examSubmitted, handleSubmit]);

  // Violation detection — tab switch
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setViolations((v) => v + 1);
        toast.warning("⚠️ Tab switch detected! This is recorded.", { duration: 3000 });
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // Mark current question as visited
  useEffect(() => {
    const id = currentQuestion.id;
    setStatuses((prev) => {
      if (prev[id] === "unvisited") return { ...prev, [id]: "visited" };
      return prev;
    });
  }, [currentIndex, currentQuestion.id]);

  const selectOption = (optionId: string) => {
    const id = currentQuestion.id;
    setResponses((prev) => ({ ...prev, [id]: optionId }));
    setStatuses((prev) => ({
      ...prev,
      [id]: prev[id] === "marked" || prev[id] === "answered_marked"
        ? "answered_marked"
        : "answered",
    }));
  };

  const clearResponse = () => {
    const id = currentQuestion.id;
    setResponses((prev) => { const n = { ...prev }; delete n[id]; return n; });
    setStatuses((prev) => ({ ...prev, [id]: "visited" }));
  };

  const markForReview = () => {
    const id = currentQuestion.id;
    setStatuses((prev) => ({
      ...prev,
      [id]: responses[id] ? "answered_marked" : "marked",
    }));
  };

  const goTo = useCallback((index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, questions.length - 1)));
  }, [questions.length]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const answered = Object.keys(responses).length;
  const marked = Object.values(statuses).filter((s) => s === "marked" || s === "answered_marked").length;
  const notVisited = Object.values(statuses).filter((s) => s === "unvisited").length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
          <p className="text-muted-foreground font-medium">Loading CBT Environment...</p>
        </div>
      </div>
    );
  }

  if (examSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="card max-w-md w-full text-center p-10"
        >
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">Exam Submitted!</h2>
          <p className="text-muted-foreground mb-6">
            You answered {answered} out of {questions.length} questions.
            {violations > 0 && ` ${violations} violation(s) detected.`}
          </p>
          <div className="grid grid-cols-2 gap-4 mb-6 text-center">
            <div className="p-4 rounded-xl bg-green-500/10">
              <div className="font-display text-2xl font-bold text-green-500">{answered}</div>
              <div className="text-xs text-muted-foreground">Answered</div>
            </div>
            <div className="p-4 rounded-xl bg-muted">
              <div className="font-display text-2xl font-bold">{questions.length - answered}</div>
              <div className="text-xs text-muted-foreground">Not Answered</div>
            </div>
          </div>
          <Link href={`/student/results/mock-attempt-${Date.now()}`} className="btn-primary w-full justify-center">
            View Results
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 md:px-6 py-3 bg-card border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="font-display font-bold text-sm md:text-base">SSC CGL Full Mock Test #12</div>
          {violations > 0 && (
            <span className="flex items-center gap-1 badge-danger text-xs">
              <AlertTriangle className="w-3 h-3" />
              {violations} Violation{violations > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Timer */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-base ${
            timeLeft < 300 ? "bg-red-500/10 text-red-500" : "bg-muted text-foreground"
          }`}>
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
          <button
            onClick={toggleFullscreen}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-muted transition-colors"
            title="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowPalette(!showPalette)}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-muted transition-colors lg:hidden"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main question area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Question header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="font-display font-bold text-lg">Q.{currentQuestion.number}</span>
                  <span className="badge-primary text-xs">+{currentQuestion.marks} marks</span>
                  <span className="badge-danger text-xs">-{currentQuestion.negativeMarks} wrong</span>
                </div>
                <button
                  onClick={markForReview}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    statuses[currentQuestion.id] === "marked" || statuses[currentQuestion.id] === "answered_marked"
                      ? "bg-purple-500/10 text-purple-500"
                      : "hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <Flag className="w-4 h-4" />
                  {statuses[currentQuestion.id] === "marked" || statuses[currentQuestion.id] === "answered_marked"
                    ? "Marked for Review"
                    : "Mark for Review"}
                </button>
              </div>

              {/* Question text */}
              <div className="card mb-6">
                <p className="text-base leading-relaxed">{currentQuestion.text}</p>
              </div>

              {/* Options */}
              <div className="space-y-3 mb-8">
                {currentQuestion.options.map((option) => {
                  const isSelected = responses[currentQuestion.id] === option.id;
                  return (
                    <motion.button
                      key={option.id}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => selectOption(option.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                        isSelected
                          ? "border-primary-500 bg-primary-500/10 text-foreground"
                          : "border-border bg-card hover:border-primary-500/30 hover:bg-muted/50"
                      }`}
                    >
                      <span
                        className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-sm font-bold transition-colors ${
                          isSelected
                            ? "bg-primary-500 text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {option.id}
                      </span>
                      <span className="text-sm">{option.text}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Navigation buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={clearResponse}
                  className="btn-ghost text-sm border border-border"
                  disabled={!responses[currentQuestion.id]}
                >
                  Clear Response
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => goTo(currentIndex - 1)}
                    disabled={currentIndex === 0}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border hover:bg-muted text-sm font-medium transition-colors disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <button
                    onClick={() => currentIndex === questions.length - 1 ? setShowSubmitConfirm(true) : goTo(currentIndex + 1)}
                    className="btn-primary text-sm px-5 py-2.5"
                  >
                    {currentIndex === questions.length - 1 ? "Submit" : "Save & Next"}
                    {currentIndex < questions.length - 1 && <ChevronRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Question Palette (right sidebar) */}
        <AnimatePresence>
          {showPalette && (
            <motion.aside
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="w-72 flex-shrink-0 bg-card border-l border-border overflow-y-auto flex flex-col"
            >
              {/* Legend */}
              <div className="p-4 border-b border-border">
                <h3 className="font-display font-bold text-sm mb-3">Question Palette</h3>
                <div className="grid grid-cols-2 gap-y-1.5 text-xs text-muted-foreground">
                  {[
                    { cls: "bg-green-500", label: `Answered (${answered})` },
                    { cls: "bg-red-500", label: `Not Answered (${questions.length - answered - notVisited})` },
                    { cls: "bg-purple-500", label: `Marked (${marked})` },
                    { cls: "bg-muted border border-border", label: `Not Visited (${notVisited})` },
                  ].map(({ cls, label }) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <span className={`w-4 h-4 rounded ${cls} flex-shrink-0`} />
                      {label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Grid */}
              <div className="p-4 flex-1">
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((q, i) => {
                    const status = statuses[q.id];
                    return (
                      <button
                        key={q.id}
                        onClick={() => goTo(i)}
                        className={`question-palette-btn ${
                          status === "answered" ? "answered" :
                          status === "answered_marked" ? "answered marked" :
                          status === "marked" ? "marked" :
                          status === "visited" ? "visited" : "unvisited"
                        } ${i === currentIndex ? "current" : ""}`}
                      >
                        {q.number}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit */}
              <div className="p-4 border-t border-border">
                <button
                  onClick={() => setShowSubmitConfirm(true)}
                  className="btn-primary w-full justify-center text-sm"
                >
                  <Send className="w-4 h-4" />
                  Submit Exam
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Submit Confirmation Modal */}
      <AnimatePresence>
        {showSubmitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card max-w-sm w-full p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-display font-bold text-lg">Submit Exam?</h3>
                <button onClick={() => setShowSubmitConfirm(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-6 text-center text-sm">
                <div className="p-3 rounded-xl bg-green-500/10">
                  <div className="font-bold text-green-500">{answered}</div>
                  <div className="text-xs text-muted-foreground">Answered</div>
                </div>
                <div className="p-3 rounded-xl bg-purple-500/10">
                  <div className="font-bold text-purple-500">{marked}</div>
                  <div className="text-xs text-muted-foreground">Marked</div>
                </div>
                <div className="p-3 rounded-xl bg-muted">
                  <div className="font-bold">{questions.length - answered}</div>
                  <div className="text-xs text-muted-foreground">Unanswered</div>
                </div>
              </div>
              <p className="text-muted-foreground text-sm mb-6">
                Are you sure you want to submit? You cannot change your answers after submission.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowSubmitConfirm(false)} className="btn-ghost flex-1 border border-border text-sm">
                  Continue Exam
                </button>
                <button onClick={handleSubmit} className="btn-primary flex-1 text-sm">
                  Yes, Submit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
