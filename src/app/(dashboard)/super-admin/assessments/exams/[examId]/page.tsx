"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Exam } from "@/types";
import { createExam, getExam, updateExam } from "@/lib/firebase/exams";
import { toast } from "sonner";
import { ChevronLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { use } from "react";

export default function ExamFormPage({ params }: { params: Promise<{ examId: string }> }) {
  const router = useRouter();
  const { examId } = use(params);
  const isNew = examId === "new";
  
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);

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
            // Format dates for inputs if they exist
            const formattedData: any = { ...data };
            if (data.startDate) {
              formattedData.startDate = new Date(data.startDate).toISOString().slice(0, 16);
            }
            if (data.endDate) {
              formattedData.endDate = new Date(data.endDate).toISOString().slice(0, 16);
            }
            reset(formattedData);
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
      // Basic type coercion
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
        await createExam(submitData);
        toast.success("Exam created successfully");
      } else {
        await updateExam(examId, submitData);
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
    </div>
  );
}
