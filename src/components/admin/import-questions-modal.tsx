"use client";

import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase/config";
import { collection, writeBatch, doc, serverTimestamp } from "firebase/firestore";
import { getSubjects } from "@/lib/firebase/subjects";
import { getChapters } from "@/lib/firebase/chapters";
import { getTopics } from "@/lib/firebase/topics";
import { Subject, Chapter, Topic, Question } from "@/types";
import { toast } from "sonner";
import {
  X, Upload, FileText, Loader2, Check, AlertCircle, Plus, Trash2, Edit2, ChevronDown, CheckCircle
} from "lucide-react";

interface ImportQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ImportQuestionsModal({ isOpen, onClose, onSuccess }: ImportQuestionsModalProps) {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "preview" | "saving">("idle");
  const [loadingStep, setLoadingStep] = useState("");
  
  // Data lists
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  // Selection state
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedChapterId, setSelectedChapterId] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("");

  // Parsed Questions state
  const [parsedQuestions, setParsedQuestions] = useState<Partial<Question>[]>([]);

  // Load classification lists
  useEffect(() => {
    if (!isOpen) return;
    const loadAcademics = async () => {
      try {
        const [subs, chaps, tops] = await Promise.all([
          getSubjects(),
          getChapters(),
          getTopics()
        ]);
        setSubjects(subs);
        setChapters(chaps);
        setTopics(tops);
      } catch (e) {
        console.error("Error loading classification options:", e);
      }
    };
    loadAcademics();
  }, [isOpen]);

  // Dropzone setup
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
      }
    },
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"]
    },
    multiple: false
  });

  if (!isOpen) return null;

  // Step 1: Upload & Convert File
  const handleUpload = async () => {
    if (!file || !user) return;
    setStatus("uploading");
    setLoadingStep("Reading document contents...");

    try {
      const token = await user.getIdToken();
      const formData = new FormData();
      formData.append("file", file);

      setTimeout(() => setLoadingStep("AI converting to CBT format..."), 1500);

      const response = await fetch("/api/admin/questions/import", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to process document");
      }

      setParsedQuestions(data);
      setStatus("preview");
      toast.success(`Successfully parsed ${data.length} questions! Please review them.`);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to import file");
      setStatus("idle");
      setFile(null);
    }
  };

  // Step 2: Edit a question in preview list
  const handleEditQuestionText = (index: number, val: string) => {
    const updated = [...parsedQuestions];
    updated[index].text = val;
    setParsedQuestions(updated);
  };

  const handleEditOptionText = (qIndex: number, optIndex: number, val: string) => {
    const updated = [...parsedQuestions];
    if (updated[qIndex].options) {
      updated[qIndex].options![optIndex].text = val;
      setParsedQuestions(updated);
    }
  };

  const handleDeletePreviewQuestion = (index: number) => {
    const updated = parsedQuestions.filter((_, i) => i !== index);
    setParsedQuestions(updated);
  };

  // Step 3: Save Questions to Firestore
  const handleSaveQuestions = async () => {
    if (parsedQuestions.length === 0) {
      toast.error("No questions to save");
      return;
    }
    if (!selectedTopicId) {
      toast.error("Please classify by selecting Subject, Chapter, and Topic first!");
      return;
    }

    setStatus("saving");
    try {
      const batch = writeBatch(db);
      
      parsedQuestions.forEach((q) => {
        const docRef = doc(collection(db, "questions"));
        batch.set(docRef, {
          ...q,
          subjectId: selectedSubjectId,
          chapterId: selectedChapterId,
          topicId: selectedTopicId,
          isActive: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      });

      await batch.commit();
      toast.success(`Successfully saved ${parsedQuestions.length} questions to the bank!`);
      onSuccess();
      onClose();
      resetState();
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to save questions: " + e.message);
      setStatus("preview");
    }
  };

  const resetState = () => {
    setFile(null);
    setStatus("idle");
    setParsedQuestions([]);
    setSelectedSubjectId("");
    setSelectedChapterId("");
    setSelectedTopicId("");
  };

  const filteredChapters = chapters.filter(c => c.subjectId === selectedSubjectId);
  const filteredTopics = topics.filter(t => t.chapterId === selectedChapterId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-card border border-border rounded-2xl shadow-xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-muted/30">
          <div>
            <h2 className="text-xl font-bold font-display flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary-500" />
              <span>Import Questions via PDF/Word</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Upload file to auto-extract questions into CBT structure using AI
            </p>
          </div>
          <button 
            onClick={() => { onClose(); resetState(); }} 
            className="p-1.5 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Wrapper */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {status === "idle" && (
            <div className="space-y-6">
              <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors duration-200
                  ${isDragActive ? "border-primary-500 bg-primary-500/5" : "border-border hover:bg-muted/30"}`}
              >
                <input {...getInputProps()} />
                <div className="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-primary-500" />
                </div>
                <h3 className="font-semibold text-lg">
                  {file ? file.name : "Drag & drop file here or click to browse"}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
                  Supports PDF (.pdf) and Microsoft Word (.docx) files up to 10MB
                </p>
              </div>

              {file && (
                <div className="flex items-center justify-between p-4 bg-muted/50 border border-border rounded-xl">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-primary-500" />
                    <div>
                      <h4 className="font-semibold text-sm">{file.name}</h4>
                      <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleUpload}
                    className="btn-primary py-2 px-5 text-sm"
                  >
                    Convert to CBT
                  </button>
                </div>
              )}
            </div>
          )}

          {status === "uploading" && (
            <div className="py-12 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
              <div className="text-center">
                <h3 className="font-semibold text-lg">Processing Document...</h3>
                <p className="text-sm text-muted-foreground mt-1">{loadingStep}</p>
              </div>
            </div>
          )}

          {status === "preview" && (
            <div className="space-y-6">
              
              {/* Classification Selector */}
              <div className="bg-muted/30 rounded-xl border border-border p-5 space-y-4">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary-500" /> Bulk Classification (Required)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Subject</label>
                    <select
                      value={selectedSubjectId}
                      onChange={(e) => {
                        setSelectedSubjectId(e.target.value);
                        setSelectedChapterId("");
                        setSelectedTopicId("");
                      }}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500/50"
                    >
                      <option value="">-- Select Subject --</option>
                      {subjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Chapter</label>
                    <select
                      value={selectedChapterId}
                      onChange={(e) => {
                        setSelectedChapterId(e.target.value);
                        setSelectedTopicId("");
                      }}
                      disabled={!selectedSubjectId}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500/50"
                    >
                      <option value="">-- Select Chapter --</option>
                      {filteredChapters.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Topic</label>
                    <select
                      value={selectedTopicId}
                      onChange={(e) => setSelectedTopicId(e.target.value)}
                      disabled={!selectedChapterId}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500/50"
                    >
                      <option value="">-- Select Topic --</option>
                      {filteredTopics.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-md">Parsed Questions ({parsedQuestions.length})</h3>
                  <p className="text-xs text-muted-foreground">Review or edit details below before saving</p>
                </div>

                {parsedQuestions.map((q, qIdx) => (
                  <div key={qIdx} className="bg-card rounded-xl border border-border p-5 space-y-4 relative group">
                    <button 
                      onClick={() => handleDeletePreviewQuestion(qIdx)}
                      className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-muted/50 transition-colors"
                      title="Remove Question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="space-y-1.5 pr-8">
                      <span className="badge-primary text-xs capitalize">Q{qIdx + 1} — {q.type} choice</span>
                      <textarea
                        value={q.text || ""}
                        onChange={(e) => handleEditQuestionText(qIdx, e.target.value)}
                        rows={2}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-medium mt-1 focus:ring-2 focus:ring-primary-500/50 resize-y"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4 border-l-2 border-muted">
                      {q.options?.map((opt, oIdx) => (
                        <div key={opt.id} className="flex gap-2 items-center">
                          <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center 
                            ${opt.isCorrect ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"}`}>
                            {oIdx + 1}
                          </span>
                          <input
                            type="text"
                            value={opt.text}
                            onChange={(e) => handleEditOptionText(qIdx, oIdx, e.target.value)}
                            className="flex-1 bg-background border border-border rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-primary-500/50"
                          />
                        </div>
                      ))}
                    </div>

                    {q.explanation && (
                      <div className="bg-muted/20 p-3 rounded-lg border border-border/30">
                        <label className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase block mb-1">Explanation</label>
                        <p className="text-xs text-muted-foreground" dangerouslySetInnerHTML={{ __html: q.explanation }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {status === "saving" && (
            <div className="py-12 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
              <div className="text-center">
                <h3 className="font-semibold text-lg">Saving Questions...</h3>
                <p className="text-sm text-muted-foreground mt-1">Batch committing into Firestore question bank</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {status === "preview" && (
          <div className="flex items-center justify-between p-6 border-t border-border bg-muted/30">
            <button 
              onClick={resetState} 
              className="px-5 py-2 text-sm rounded-xl bg-muted hover:bg-muted/80 font-medium transition-colors"
            >
              Start Over
            </button>
            <button 
              onClick={handleSaveQuestions}
              className="btn-primary py-2 px-6 text-sm flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Save & Publish {parsedQuestions.length} Questions</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
