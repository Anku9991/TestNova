"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Topic, Chapter } from "@/types";
import { createTopic, getTopic, updateTopic } from "@/lib/firebase/topics";
import { getChapters } from "@/lib/firebase/chapters";
import { toast } from "sonner";
import { ChevronLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { use } from "react";

export default function TopicFormPage({ params }: { params: Promise<{ topicId: string }> }) {
  const router = useRouter();
  const { topicId } = use(params);
  const isNew = topicId === "new";

  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Partial<Topic>>({
    defaultValues: {
      difficulty: "medium",
    }
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const chaptersData = await getChapters();
        setChapters(chaptersData);

        if (!isNew) {
          const topicData = await getTopic(topicId);
          if (topicData) {
            reset(topicData);
          } else {
            toast.error("Topic not found");
            router.push("/super-admin/academics/topics");
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
  }, [topicId, isNew, reset, router]);

  const onSubmit = async (data: Partial<Topic>) => {
    setIsSaving(true);
    try {
      const submitData = {
        ...data,
        estimatedTime: data.estimatedTime ? Number(data.estimatedTime) : undefined,
      };

      if (isNew) {
        await createTopic(submitData as any);
        toast.success("Topic created successfully");
      } else {
        await updateTopic(topicId, submitData);
        toast.success("Topic updated successfully");
      }
      router.push("/super-admin/academics/topics");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save topic");
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
        <Link href="/super-admin/academics/topics" className="p-2 hover:bg-muted rounded-xl transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-display">{isNew ? "Create Topic" : "Edit Topic"}</h1>
          <p className="text-muted-foreground">{isNew ? "Add a new topic to a chapter" : "Update topic details"}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-card rounded-xl border border-border p-6 space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Chapter *</label>
            <select
              {...register("chapterId", { required: "Chapter is required" })}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500/50"
            >
              <option value="">-- Select a Chapter --</option>
              {chapters.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
            {errors.chapterId && <p className="text-red-500 text-xs">{errors.chapterId.message as string}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Topic Title *</label>
            <input
              {...register("title", { required: "Title is required" })}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500/50"
              placeholder="e.g., Simplification"
            />
            {errors.title && <p className="text-red-500 text-xs">{errors.title.message as string}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Estimated Time (mins)</label>
              <input
                type="number"
                {...register("estimatedTime", { min: 1 })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500/50"
                placeholder="e.g., 30"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Difficulty Level *</label>
              <select
                {...register("difficulty", { required: "Difficulty is required" })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500/50"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              {errors.difficulty && <p className="text-red-500 text-xs">{errors.difficulty.message as string}</p>}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-border">
          <Link href="/super-admin/academics/topics" className="px-6 py-2 rounded-xl bg-muted hover:bg-muted/80 font-medium transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={isSaving} className="btn-primary flex items-center gap-2">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Topic</span>
          </button>
        </div>
      </form>
    </div>
  );
}
