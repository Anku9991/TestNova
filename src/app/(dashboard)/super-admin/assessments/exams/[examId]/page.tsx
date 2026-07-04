"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Exam } from "@/types";
import { createExam, getExam, updateExam } from "@/lib/firebase/exams";
import { toast } from "sonner";
import { ChevronLeft, Loader2, Save, List, X, Search, CheckCircle, Plus } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/firebase/config";
import { collection, query, where, getDocs, updateDoc, doc, limit } from "firebase/firestore";
import { logAuditAction } from "@/lib/firebase/audit";
import { useAuth } from "@/hooks/useAuth";

export default function ExamFormPage({ params }: { params: Promise<{ examId: string }> }) {
  const router = useRouter();
  const { examId } = use(params);
  const isNew = examId === "new";
  const { userProfile } = useAuth();
  
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);

  // Question Management State
  const [assignedQuestions, setAssignedQuestions] = useState<any[]>([]);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [availableQuestions, setAvailableQuestions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<Partial<Exam>>({
    defaultValues: {
      category: "mock",
      difficulty: "medium",
      isPublished: false,
      isFree: false,
      isPremium: false,
      tags: [],
    }
  });

  const watchCategory = watch("category");

  useEffect(() => {
    if (!isNew) {
      const loadExam = async () => {
        try {
          const data = await getExam(examId);
          if (data) {
            const formattedData: any = { ...data };
            if (data.startDate) formattedData.startDate = new Date(data.startDate).toISOString().slice(0, 16);
            if (data.endDate) formattedData.endDate = new Date(data.endDate).toISOString().slice(0, 16);
            reset(formattedData);

            // Load assigned questions
            const qSnap = await getDocs(query(collection(db, "questions"), where("examId", "==", examId)));
            setAssignedQuestions(qSnap.docs.map(d => ({ id: d.id, ...d.data() })));
          } else {
            toast.error("Exam not found");
            router.push("/super-admin/assessments/exams");
          }
        } catch (error) {
          console.error(error);
          toast.error("Failed to load exam");
        } finally {
          setIsLoading(false);
        }
      };
      loadExam();
    }
  }, [examId, isNew, reset, router]);

  const onSubmit = async (data: Partial<Exam>) => {
    setIsSaving(true);
    try {
      const submitData: any = {
        ...data,
        duration: Number(data.duration),
        totalQuestions: Number(data.totalQuestions),
        totalMarks: Number(data.totalMarks),
        negativeMarking: Number(data.negativeMarking),
        passingMarks: data.passingMarks ? Number(data.passingMarks) : undefined,
      };

      if (data.startDate) submitData.startDate = new Date(data.startDate);
      if (data.endDate) submitData.endDate = new Date(data.endDate);

      if (isNew) {
        await createExam(submitData as any);
        if (userProfile) await logAuditAction("CREATE_EXAM", userProfile, `Created exam: ${submitData.title}`, "exams");
        toast.success("Exam created successfully");
      } else {
        await updateExam(examId, submitData as any);
        if (userProfile) await logAuditAction("UPDATE_EXAM", userProfile, `Updated exam: ${submitData.title}`, "exams", examId);
        toast.success("Exam updated successfully");
      }
      router.push("/super-admin/assessments/exams");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save exam");
    } finally {
      setIsSaving(false);
    }
  };

  const openQuestionManager = async () => {
    setIsQuestionModalOpen(true);
    setLoadingQuestions(true);
    try {
      const snap = await getDocs(query(collection(db, "questions"), limit(200)));
      setAvailableQuestions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      toast.error("Failed to fetch question bank");
    } finally {
      setLoadingQuestions(false);
    }
  };

  const toggleQuestionAssignment = async (questionId: string, currentExamId?: string) => {
    try {
      if (currentExamId === examId) {
        await updateDoc(doc(db, "questions", questionId), { examId: null });
        setAssignedQuestions(prev => prev.filter(q => q.id !== questionId));
        setAvailableQuestions(prev => prev.map(q => q.id === questionId ? { ...q, examId: null } : q));
        if (userProfile) await logAuditAction("UNASSIGN_QUESTION", userProfile, `Removed question ${questionId} from exam ${examId}`, "questions", questionId);
        toast.success("Question unassigned");
      } else {
        await updateDoc(doc(db, "questions", questionId), { examId });
        const assignedQ = availableQuestions.find(q => q.id === questionId);
        if (assignedQ) {
          setAssignedQuestions(prev => [...prev, { ...assignedQ, examId }]);
          setAvailableQuestions(prev => prev.map(q => q.id === questionId ? { ...q, examId } : q));
        }
        if (userProfile) await logAuditAction("ASSIGN_QUESTION", userProfile, `Assigned question ${questionId} to exam ${examId}`, "questions", questionId);
        toast.success("Question assigned");
      }
    } catch (e) {
      toast.error("Failed to update assignment");
    }
  };

  const filteredQuestions = availableQuestions.filter(q => 
    q.text?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    q.tags?.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/super-admin/assessments/exams" className="p-2 hover:bg-muted rounded-xl transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-display">{isNew ? "Create Exam" : "Edit Exam"}</h1>
          <p className="text-muted-foreground">{isNew ? "Configure a new exam or test" : "Update exam details"}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Basic Info */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-6">
          <h2 className="text-lg font-semibold border-b border-border pb-2">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Exam Title *</label>
              <input
                {...register("title", { required: "Title is required" })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500/50"
                placeholder="e.g., SSC CGL Tier 1 Mock Test - 1"
              />
              {errors.title && <p className="text-red-500 text-xs">{errors.title.message as string}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                {...register("description")}
                rows={3}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500/50 resize-y"
                placeholder="Brief description of the exam..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category *</label>
              <select
                {...register("category", { required: "Category is required" })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500/50"
              >
                <option value="mock">Mock Test</option>
                <option value="live">Live Test</option>
                <option value="practice">Practice Test</option>
                <option value="pyp">Previous Year Paper</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Difficulty</label>
              <select
                {...register("difficulty")}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500/50"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>

          </div>
        </div>

        {/* Test Configuration */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-6">
          <h2 className="text-lg font-semibold border-b border-border pb-2">Configuration & Marking</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Duration (Mins) *</label>
              <input
                type="number"
                {...register("duration", { required: true, min: 1 })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Total Questions *</label>
              <input
                type="number"
                {...register("totalQuestions", { required: true, min: 1 })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Total Marks *</label>
              <input
                type="number"
                {...register("totalMarks", { required: true, min: 1 })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Passing Marks</label>
              <input
                type="number"
                {...register("passingMarks", { min: 0 })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Negative Marking (e.g. 0.25) *</label>
              <input
                type="number"
                step="0.01"
                {...register("negativeMarking", { required: true, min: 0 })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500/50"
              />
            </div>
          </div>
        </div>

        {/* Question Management (Only for existing exams) */}
        {!isNew && (
          <div className="bg-card rounded-xl border border-border p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h2 className="text-lg font-semibold">Question Assignment</h2>
              <button 
                type="button" 
                onClick={openQuestionManager}
                className="btn-primary py-1.5 px-4 text-sm"
              >
                <List className="w-4 h-4 mr-2" /> Manage Questions
              </button>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm mb-4">
                <span className="font-medium text-muted-foreground">{assignedQuestions.length} Questions Assigned</span>
                <span className="text-xs text-primary-500 bg-primary-500/10 px-2 py-1 rounded-full">{watch("totalQuestions")} Required</span>
              </div>
              
              {assignedQuestions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-xl border border-dashed border-border">
                  No questions assigned to this exam yet.
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {assignedQuestions.map((q, i) => (
                    <div key={q.id} className="flex items-start gap-3 p-3 rounded-lg bg-background border border-border">
                      <span className="font-mono text-xs text-muted-foreground pt-0.5">Q{i+1}</span>
                      <div className="flex-1">
                        <p className="text-sm line-clamp-2">{q.text}</p>
                        <div className="flex gap-2 mt-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted uppercase">{q.difficulty || "medium"}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-500">{q.marks || 1} Marks</span>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => toggleQuestionAssignment(q.id, examId)}
                        className="text-red-500 hover:bg-red-500/10 p-1.5 rounded-md transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Scheduling (Only for Live Tests) */}
        {watchCategory === "live" && (
          <div className="bg-card rounded-xl border border-border p-6 space-y-6 border-l-4 border-l-primary-500">
            <h2 className="text-lg font-semibold border-b border-border pb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Live Test Scheduling
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Time</label>
                <input
                  type="datetime-local"
                  {...register("startDate")}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Time</label>
                <input
                  type="datetime-local"
                  {...register("endDate")}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500/50"
                />
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-6">
          <h2 className="text-lg font-semibold border-b border-border pb-2">Instructions</h2>
          <div className="space-y-2">
            <textarea
              {...register("instructions")}
              rows={5}
              className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500/50 resize-y"
              placeholder="Enter exam instructions for students (HTML supported)..."
            />
          </div>

          <div className="flex items-center gap-6 pt-4">
            <label className="text-sm font-medium flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register("isPublished")} className="w-4 h-4 rounded text-primary-500" />
              Published (Visible to students)
            </label>
            <label className="text-sm font-medium flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register("isFree")} className="w-4 h-4 rounded text-primary-500" />
              Free Exam
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link href="/super-admin/assessments/exams" className="px-6 py-2 rounded-xl bg-muted hover:bg-muted/80 font-medium transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={isSaving} className="btn-primary flex items-center gap-2">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Exam Configuration</span>
          </button>
        </div>
      </form>

      {/* Question Picker Modal */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
              <div>
                <h3 className="font-display font-bold text-lg">Question Bank Picker</h3>
                <p className="text-xs text-muted-foreground">Select questions to assign to this exam</p>
              </div>
              <button onClick={() => setIsQuestionModalOpen(false)} className="p-2 hover:bg-muted rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 border-b border-border bg-background">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search questions by text or tags..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-muted/10">
              {loadingQuestions ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                </div>
              ) : filteredQuestions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No questions found in bank.</div>
              ) : (
                filteredQuestions.map((q) => {
                  const isAssignedToThis = q.examId === examId;
                  const isAssignedToOther = q.examId && q.examId !== examId;
                  
                  return (
                    <div key={q.id} className={`flex items-start gap-4 p-4 rounded-xl border ${isAssignedToThis ? "border-primary-500 bg-primary-500/5" : "border-border bg-card"} transition-all`}>
                      <div className="flex-1">
                        <p className="text-sm mb-2">{q.text}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted uppercase">{q.difficulty || "medium"}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{q.marks || 1} Marks</span>
                          {q.tags?.map((t: string) => (
                            <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary-500/10 text-secondary-500">#{t}</span>
                          ))}
                        </div>
                        {isAssignedToOther && (
                          <p className="text-xs text-orange-500 mt-2">Currently assigned to another exam ({q.examId.slice(0,6)}...)</p>
                        )}
                      </div>
                      <button
                        onClick={() => toggleQuestionAssignment(q.id, q.examId)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          isAssignedToThis 
                            ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" 
                            : "bg-primary-500 text-white hover:bg-primary-600 shadow-glow-sm"
                        }`}
                      >
                        {isAssignedToThis ? (
                          <><X className="w-4 h-4" /> Remove</>
                        ) : (
                          <><Plus className="w-4 h-4" /> Assign</>
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
            
            <div className="p-4 border-t border-border bg-card flex justify-between items-center">
              <span className="text-sm font-medium">Total Assigned: {assignedQuestions.length}</span>
              <button onClick={() => setIsQuestionModalOpen(false)} className="btn-primary">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
