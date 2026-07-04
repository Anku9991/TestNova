"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Subject, Course } from "@/types";
import { createSubject, getSubject, updateSubject } from "@/lib/firebase/subjects";
import { getCourses } from "@/lib/firebase/courses";
import { toast } from "sonner";
import { ChevronLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { use } from "react";

export default function SubjectFormPage({ params }: { params: Promise<{ subjectId: string }> }) {
  const router = useRouter();
  const { subjectId } = use(params);
  const isNew = subjectId === "new";
  
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Partial<Subject>>();

  useEffect(() => {
    const loadData = async () => {
      try {
        const coursesData = await getCourses();
        setCourses(coursesData);

        if (!isNew) {
          const subjectData = await getSubject(subjectId);
          if (subjectData) {
            reset(subjectData);
          } else {
            toast.error("Subject not found");
            router.push("/super-admin/academics/subjects");
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
  }, [subjectId, isNew, reset, router]);

  const onSubmit = async (data: Partial<Subject>) => {
    setIsSaving(true);
    try {
      if (isNew) {
        await createSubject(data as any);
        toast.success("Subject created successfully");
      } else {
        await updateSubject(subjectId, data);
        toast.success("Subject updated successfully");
      }
      router.push("/super-admin/academics/subjects");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save subject");
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
        <Link href="/super-admin/academics/subjects" className="p-2 hover:bg-muted rounded-xl transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-display">{isNew ? "Create Subject" : "Edit Subject"}</h1>
          <p className="text-muted-foreground">{isNew ? "Add a new subject to a course" : "Update subject details"}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-card rounded-xl border border-border p-6 space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Course *</label>
            <select
              {...register("courseId", { required: "Course is required" })}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500/50"
            >
              <option value="">-- Select a Course --</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
            {errors.courseId && <p className="text-red-500 text-xs">{errors.courseId.message as string}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Subject Title *</label>
            <input
              {...register("title", { required: "Title is required" })}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500/50"
              placeholder="e.g., Quantitative Aptitude"
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
              <label className="text-sm font-medium">Icon Name (Lucide)</label>
              <input
                {...register("icon")}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500/50"
                placeholder="e.g., Book"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Theme Color (Hex)</label>
              <input
                {...register("color")}
                type="color"
                className="w-full bg-background border border-border rounded-lg h-10 px-2 cursor-pointer focus:ring-2 focus:ring-primary-500/50"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-border">
          <Link href="/super-admin/academics/subjects" className="px-6 py-2 rounded-xl bg-muted hover:bg-muted/80 font-medium transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={isSaving} className="btn-primary flex items-center gap-2">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Subject</span>
          </button>
        </div>
      </form>
    </div>
  );
}
