"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Course } from "@/types";
import { createCourse, getCourse, updateCourse } from "@/lib/firebase/courses";
import { toast } from "sonner";
import { ChevronLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { use } from "react";

export default function CourseFormPage({ params }: { params: Promise<{ courseId: string }> }) {
  const router = useRouter();
  const { courseId } = use(params);
  const isNew = courseId === "new";
  
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Partial<Course>>({
    defaultValues: {
      isPublished: false,
      level: "beginner",
      language: "English",
      tags: [],
    }
  });

  useEffect(() => {
    if (!isNew) {
      const loadCourse = async () => {
        try {
          const data = await getCourse(courseId);
          if (data) {
            reset(data);
          } else {
            toast.error("Course not found");
            router.push("/super-admin/academics/courses");
          }
        } catch (error) {
          console.error(error);
          toast.error("Failed to load course");
        } finally {
          setIsLoading(false);
        }
      };
      loadCourse();
    }
  }, [courseId, isNew, reset, router]);

  const onSubmit = async (data: Partial<Course>) => {
    setIsSaving(true);
    try {
      // Basic type coercion
      const submitData = {
        ...data,
        price: Number(data.price),
        offerPrice: data.offerPrice ? Number(data.offerPrice) : undefined,
        durationInMonths: data.durationInMonths ? Number(data.durationInMonths) : undefined,
      };

      if (isNew) {
        await createCourse(submitData as any);
        toast.success("Course created successfully");
      } else {
        await updateCourse(courseId, submitData);
        toast.success("Course updated successfully");
      }
      router.push("/super-admin/academics/courses");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save course");
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
        <Link href="/super-admin/academics/courses" className="p-2 hover:bg-muted rounded-xl transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-display">{isNew ? "Create Course" : "Edit Course"}</h1>
          <p className="text-muted-foreground">{isNew ? "Add a new course to the catalog" : "Update course details"}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-card rounded-xl border border-border p-6 space-y-6">
          <h2 className="text-lg font-semibold border-b border-border pb-2">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Course Title *</label>
              <input
                {...register("title", { required: "Title is required" })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500/50"
                placeholder="e.g., SSC CGL Complete Foundation Batch"
              />
              {errors.title && <p className="text-red-500 text-xs">{errors.title.message as string}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                {...register("description")}
                rows={4}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500/50 resize-none"
                placeholder="Detailed description of the course..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Regular Price (₹) *</label>
              <input
                type="number"
                {...register("price", { required: "Price is required", min: 0 })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Offer Price (₹)</label>
              <input
                type="number"
                {...register("offerPrice", { min: 0 })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Duration (Months)</label>
              <input
                type="number"
                {...register("durationInMonths", { min: 1 })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Level</label>
              <select
                {...register("level")}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500/50"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Language</label>
              <select
                {...register("language")}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500/50"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Hinglish">Hinglish</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <input type="checkbox" {...register("isPublished")} className="rounded text-primary-500" />
                Publish Course
              </label>
              <p className="text-xs text-muted-foreground ml-6">
                Published courses are visible to students. Draft courses are hidden.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link href="/super-admin/academics/courses" className="px-6 py-2 rounded-xl bg-muted hover:bg-muted/80 font-medium transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={isSaving} className="btn-primary flex items-center gap-2">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Course</span>
          </button>
        </div>
      </form>
    </div>
  );
}
