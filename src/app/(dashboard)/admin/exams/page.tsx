"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Plus, Edit, Trash2, Search, Loader2, AlertCircle, 
  FileText, CheckCircle, XCircle 
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase/config";
import { 
  collection, getDocs, query, orderBy, 
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp 
} from "firebase/firestore";
import { toast } from "sonner";
import type { Exam } from "@/types";

export default function AdminExamsPage() {
  const { userProfile } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [duration, setDuration] = useState(60);
  const [totalQuestions, setTotalQuestions] = useState(100);
  const [totalMarks, setTotalMarks] = useState(200);
  const [negativeMarking, setNegativeMarking] = useState(0.5);
  const [isPublished, setIsPublished] = useState(false);
  const [isFree, setIsFree] = useState(false);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | "mixed">("mixed");

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "exams"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const fetchedExams: Exam[] = [];
      snapshot.forEach((doc) => {
        fetchedExams.push({ id: doc.id, ...doc.data() } as Exam);
      });
      setExams(fetchedExams);
    } catch (error) {
      console.error("Error fetching exams:", error);
      toast.error("Failed to fetch exams");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (exam?: Exam) => {
    if (exam) {
      setEditingExam(exam);
      setTitle(exam.title);
      setCategory(exam.category);
      setDuration(exam.duration);
      setTotalQuestions(exam.totalQuestions);
      setTotalMarks(exam.totalMarks);
      setNegativeMarking(exam.negativeMarking);
      setIsPublished(exam.isPublished);
      setIsFree(exam.isFree);
      setDifficulty(exam.difficulty);
    } else {
      setEditingExam(null);
      setTitle("");
      setCategory("");
      setDuration(60);
      setTotalQuestions(100);
      setTotalMarks(200);
      setNegativeMarking(0.5);
      setIsPublished(false);
      setIsFree(false);
      setDifficulty("mixed");
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    const examData = {
      title,
      category,
      duration,
      totalQuestions,
      totalMarks,
      negativeMarking,
      isPublished,
      isFree,
      isPremium: !isFree,
      difficulty,
      description: `${title} - Complete Mock Test`,
      instructions: "Standard CBT instructions apply.",
      tags: [category.toLowerCase()],
      updatedAt: serverTimestamp(),
    };

    try {
      if (editingExam) {
        await updateDoc(doc(db, "exams", editingExam.id), examData);
        toast.success("Exam updated successfully!");
      } else {
        await addDoc(collection(db, "exams"), {
          ...examData,
          createdBy: userProfile.uid,
          createdAt: serverTimestamp(),
          attemptCount: 0,
        });
        toast.success("Exam created successfully!");
      }
      setIsModalOpen(false);
      fetchExams();
    } catch (error) {
      console.error("Error saving exam:", error);
      toast.error("Failed to save exam");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this exam?")) return;
    try {
      await deleteDoc(doc(db, "exams", id));
      toast.success("Exam deleted!");
      fetchExams();
    } catch (error) {
      console.error("Error deleting exam:", error);
      toast.error("Failed to delete exam");
    }
  };

  const filteredExams = exams.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-2">
            <FileText className="w-8 h-8 text-primary-500" />
            Exam Management
          </h1>
          <p className="text-muted-foreground mt-1">Create and manage CBT mock tests.</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary">
          <Plus className="w-5 h-5" />
          Create Exam
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card flex items-center gap-3 p-3">
        <Search className="w-5 h-5 text-muted-foreground ml-2" />
        <input 
          type="text" 
          placeholder="Search exams by title or category..." 
          className="bg-transparent border-none focus:outline-none flex-1 text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Exams List */}
      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredExams.map((exam) => (
            <motion.div key={exam.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <span className="badge-primary text-xs">{exam.category}</span>
                <span className={`badge-${exam.isPublished ? "success" : "warning"} text-xs flex items-center gap-1`}>
                  {exam.isPublished ? <CheckCircle className="w-3 h-3"/> : <AlertCircle className="w-3 h-3"/>}
                  {exam.isPublished ? "Published" : "Draft"}
                </span>
              </div>
              <h3 className="font-bold text-lg mb-1 leading-snug">{exam.title}</h3>
              
              <div className="grid grid-cols-2 gap-2 mt-4 text-sm text-muted-foreground flex-1">
                <div>Questions: <strong className="text-foreground">{exam.totalQuestions}</strong></div>
                <div>Marks: <strong className="text-foreground">{exam.totalMarks}</strong></div>
                <div>Duration: <strong className="text-foreground">{exam.duration}m</strong></div>
                <div>Access: <strong className="text-foreground">{exam.isFree ? "Free" : "Premium"}</strong></div>
              </div>

              <div className="flex items-center gap-2 mt-6 pt-4 border-t border-border">
                <button onClick={() => openModal(exam)} className="btn-ghost flex-1 border border-border text-xs py-2">
                  <Edit className="w-4 h-4" /> Edit
                </button>
                <button onClick={() => handleDelete(exam.id)} className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-500/10 text-red-500 hover:bg-red-500/20">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
          {filteredExams.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No exams found.
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="card max-w-2xl w-full max-h-[90vh] flex flex-col"
          >
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h2 className="font-display font-bold text-xl">{editingExam ? "Edit Exam" : "Create New Exam"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto pr-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1.5">Exam Title</label>
                  <input required type="text" value={title} onChange={(e)=>setTitle(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:border-primary-500 outline-none" placeholder="e.g. SSC CGL Tier 1 Mock Test 1" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1.5">Category</label>
                  <input required type="text" value={category} onChange={(e)=>setCategory(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:border-primary-500 outline-none" placeholder="e.g. SSC" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1.5">Difficulty</label>
                  <select value={difficulty} onChange={(e)=>setDifficulty(e.target.value as any)} className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:border-primary-500 outline-none">
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1.5">Duration (mins)</label>
                  <input required type="number" value={duration} onChange={(e)=>setDuration(Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:border-primary-500 outline-none" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1.5">Total Questions</label>
                  <input required type="number" value={totalQuestions} onChange={(e)=>setTotalQuestions(Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:border-primary-500 outline-none" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1.5">Total Marks</label>
                  <input required type="number" value={totalMarks} onChange={(e)=>setTotalMarks(Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:border-primary-500 outline-none" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1.5">Negative Marking</label>
                  <input required type="number" step="0.1" value={negativeMarking} onChange={(e)=>setNegativeMarking(Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:border-primary-500 outline-none" />
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-xl bg-muted/50 mt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={isPublished} onChange={(e)=>setIsPublished(e.target.checked)} className="w-4 h-4" />
                  <span className="text-sm font-medium">Publish Exam</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={isFree} onChange={(e)=>setIsFree(e.target.checked)} className="w-4 h-4" />
                  <span className="text-sm font-medium">Free Access (No subscription required)</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-ghost">Cancel</button>
                <button type="submit" className="btn-primary">Save Exam</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
