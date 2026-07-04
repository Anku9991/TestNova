"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { Question, Subject, Chapter, Topic } from "@/types";
import { createQuestion, getQuestion, updateQuestion } from "@/lib/firebase/questions";
import { getSubjects } from "@/lib/firebase/subjects";
import { getChapters } from "@/lib/firebase/chapters";
import { getTopics } from "@/lib/firebase/topics";
import { toast } from "sonner";
import { ChevronLeft, Loader2, Save, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { use } from "react";

export default function QuestionFormPage({ params }: { params: Promise<{ questionId: string }> }) {
  const router = useRouter();
  const { questionId } = use(params);
  const isNew = questionId === "new";
  
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  const { register, handleSubmit, reset, watch, control, formState: { errors } } = useForm<Partial<Question>>({
    defaultValues: {
      type: "single",
      difficulty: "medium",
      isActive: true,
      marks: 1,
      negativeMarks: 0,
      options: [
        { id: "opt1", text: "", isCorrect: true },
        { id: "opt2", text: "", isCorrect: false },
        { id: "opt3", text: "", isCorrect: false },
        { id: "opt4", text: "", isCorrect: false },
      ],
      correctAnswer: "opt1" // Will manage manually for multiple
    }
  });

  const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({
    control,
    name: "options"
  });

  const watchType = watch("type");
  const watchSubjectId = watch("subjectId");
  const watchChapterId = watch("chapterId");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [subjectsData, chaptersData, topicsData] = await Promise.all([
          getSubjects(),
          getChapters(),
          getTopics()
        ]);
        setSubjects(subjectsData);
        setChapters(chaptersData);
        setTopics(topicsData);

        if (!isNew) {
          const questionData = await getQuestion(questionId);
          if (questionData) {
            reset(questionData);
          } else {
            toast.error("Question not found");
            router.push("/super-admin/assessments/question-bank");
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
  }, [questionId, isNew, reset, router]);

  const filteredChapters = chapters.filter(c => c.subjectId === watchSubjectId);
  const filteredTopics = topics.filter(t => t.chapterId === watchChapterId);

  const onSubmit = async (data: Partial<Question>) => {
    setIsSaving(true);
    try {
      const submitData = {
        ...data,
        marks: Number(data.marks),
        negativeMarks: Number(data.negativeMarks),
      };

      // Set options ID properly for true_false
      if (submitData.type === "true_false") {
        submitData.options = [
          { id: "true", text: "True", isCorrect: submitData.correctAnswer === "true" },
          { id: "false", text: "False", isCorrect: submitData.correctAnswer === "false" }
        ];
      }

      if (isNew) {
        await createQuestion(submitData as any);
        toast.success("Question created successfully");
      } else {
        await updateQuestion(questionId, submitData);
        toast.success("Question updated successfully");
      }
      router.push("/super-admin/assessments/question-bank");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save question");
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
        <Link href="/super-admin/assessments/question-bank" className="p-2 hover:bg-muted rounded-xl transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-display">{isNew ? "Create Question" : "Edit Question"}</h1>
          <p className="text-muted-foreground">{isNew ? "Add a new question to the bank" : "Update question details"}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Basic Settings */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-6">
          <h2 className="text-lg font-semibold border-b border-border pb-2">Classification</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <select {...register("subjectId")} className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500/50">
                <option value="">-- Select Subject --</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Chapter</label>
              <select {...register("chapterId")} disabled={!watchSubjectId} className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500/50">
                <option value="">-- Select Chapter --</option>
                {filteredChapters.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Topic *</label>
              <select {...register("topicId", { required: "Topic is required" })} disabled={!watchChapterId} className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500/50">
                <option value="">-- Select Topic --</option>
                {filteredTopics.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
              {errors.topicId && <p className="text-red-500 text-xs">{errors.topicId.message as string}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Question Type *</label>
              <select {...register("type", { required: "Type is required" })} className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500/50">
                <option value="single">Single Choice</option>
                <option value="multiple">Multiple Choice</option>
                <option value="true_false">True / False</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Difficulty</label>
              <select {...register("difficulty")} className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500/50">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="flex gap-4">
              <div className="space-y-2 w-1/2">
                <label className="text-sm font-medium">+ Marks</label>
                <input type="number" step="0.5" {...register("marks", { required: true, min: 0 })} className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500/50" />
              </div>
              <div className="space-y-2 w-1/2">
                <label className="text-sm font-medium">- Marks</label>
                <input type="number" step="0.25" {...register("negativeMarks", { required: true, min: 0 })} className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500/50" />
              </div>
            </div>
          </div>
        </div>

        {/* Question Text */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold border-b border-border pb-2">Question Content</h2>
          <div className="space-y-2">
            <label className="text-sm font-medium">Question Text * (HTML Supported)</label>
            <textarea
              {...register("text", { required: "Question text is required" })}
              rows={5}
              className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500/50 resize-y"
              placeholder="Enter question text here..."
            />
            {errors.text && <p className="text-red-500 text-xs">{errors.text.message as string}</p>}
          </div>
          
          {/* Options Builder */}
          {watchType !== "true_false" && (
            <div className="pt-4 border-t border-border mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-md font-medium">Options</h3>
                <button type="button" onClick={() => appendOption({ id: `opt${Date.now()}`, text: "", isCorrect: false })} className="text-sm text-primary-500 flex items-center gap-1 hover:underline">
                  <Plus className="w-4 h-4" /> Add Option
                </button>
              </div>
              
              <div className="space-y-3">
                {optionFields.map((field, index) => (
                  <div key={field.id} className="flex gap-3 items-center">
                    <div className="pt-2">
                      {watchType === "single" ? (
                        <input type="radio" value={field.id} {...register("correctAnswer")} className="w-4 h-4 text-primary-500" />
                      ) : (
                        <input type="checkbox" {...register(`options.${index}.isCorrect` as const)} className="w-4 h-4 rounded text-primary-500" />
                      )}
                    </div>
                    <input
                      {...register(`options.${index}.text` as const, { required: true })}
                      className="flex-1 bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500/50"
                      placeholder={`Option ${index + 1}`}
                    />
                    <input type="hidden" {...register(`options.${index}.id` as const)} />
                    <button type="button" onClick={() => removeOption(index)} className="p-2 text-muted-foreground hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {watchType === "true_false" && (
            <div className="pt-4 border-t border-border mt-6">
              <h3 className="text-md font-medium mb-4">Correct Answer</h3>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg cursor-pointer hover:bg-muted">
                  <input type="radio" value="true" {...register("correctAnswer")} className="w-4 h-4 text-primary-500" />
                  True
                </label>
                <label className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg cursor-pointer hover:bg-muted">
                  <input type="radio" value="false" {...register("correctAnswer")} className="w-4 h-4 text-primary-500" />
                  False
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Explanation */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold border-b border-border pb-2">Explanation</h2>
          <div className="space-y-2">
            <label className="text-sm font-medium">Detailed Explanation (Shown after submission)</label>
            <textarea
              {...register("explanation")}
              rows={4}
              className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500/50 resize-y"
              placeholder="Enter explanation..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link href="/super-admin/assessments/question-bank" className="px-6 py-2 rounded-xl bg-muted hover:bg-muted/80 font-medium transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={isSaving} className="btn-primary flex items-center gap-2">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Question</span>
          </button>
        </div>
      </form>
    </div>
  );
}
