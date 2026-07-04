"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Chapter, Subject } from "@/types";
import { createChapter, getChapter, updateChapter } from "@/lib/firebase/chapters";
import { getSubjects } from "@/lib/firebase/subjects";
import { toast } from "sonner";
import { ChevronLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { use } from "react";

export default function ChapterFormPage({ params }: { params: Promise<{ chapterId: string }> }) {
  const router = useRouter();
  const { chapterId } = use(params);
  const isNew = chapterId === "new";
  
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Partial<Chapter>>({
    defaultValues: {
      isLocked: false,
      sequence: 1,
    }
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const subjectsData = await getSubjects();
        setSubjects(subjectsData);

        if (!isNew) {
          const chapterData = await getChapter(chapterId);
          if (chapterData) {
            reset(chapterData);
          } else {
            toast.error("Chapter not found");
            router.push("/super-admin/academics/chapters");
          }
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [chapterId, isNew, reset, router]);

  const onSubmit = async (data: Partial<Chapter>) => {
    setIsSaving(true);
    try {
      const submitData = {
        ...data,
        sequence: Number(data.sequence),
      };

      if (isNew) {
        await createChapter(submitData as any);
        toast.success("Chapter created successfully");
      } else {
        await updateChapter(chapterId, submitData);
        toast.success("Chapter updated successfully");
      }
      router.push("/super-admin/academics/chapters");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save chapter");
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
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/super-admin/academics/chapters" className="p-2 hover:bg-muted rounded-xl transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-display">{isNew ? "Create Chapter" : "Edit Chapter"}</h1>
          <p className="text-muted-foreground">{isNew ? "Add a new chapter to a subject" : "Update chapter details"}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-card rounded-xl border border-border p-6 space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Subject *</label>
            <select
              {...register("subjectId", { required: "Subject is required" })}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500/50"
            >
              <option value="">-- Select a Subject --</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
            {errors.subjectId && <p className="text-red-500 text-xs">{errors.subjectId.message as string}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Chapter Title *</label>
            <input
              {...register("title", { required: "Title is required" })}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500/50"
              placeholder="e.g., Number System"
            />
            {errors.title && <p className="text-red-500 text-xs">{errors.title.message as string}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              {...register("description")}
              rows={3}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500/50 resize-none"
              placeholder="Optional description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Sequence (Order) *</label>
              <input
                type="number"
                {...register("sequence", { required: "Sequence is required", min: 1 })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500/50"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <input type="checkbox" {...register("isLocked")} className="rounded text-primary-500" />
              Lock Chapter
            </label>
            <p className="text-xs text-muted-foreground ml-6">
              Locked chapters require students to complete previous chapters first (or buy subscription).
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-border">
          <Link href="/super-admin/academics/chapters" className="px-6 py-2 rounded-xl bg-muted hover:bg-muted/80 font-medium transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={isSaving} className="btn-primary flex items-center gap-2">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Chapter</span>
          </button>
        </div>
      </form>
    </div>
  );
}
