"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { 
  Plus, Upload, Search, Loader2, FileText, Trash2, Edit 
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase/config";
import { 
  collection, getDocs, query, orderBy, 
  addDoc, deleteDoc, doc, serverTimestamp, limit 
} from "firebase/firestore";
import { toast } from "sonner";
import type { Question, QuestionOption } from "@/types";
import Papa from "papaparse";

export default function AdminQuestionsPage() {
  const { userProfile } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      // Limit to 50 for performance in admin view (in production, use pagination)
      const q = query(collection(db, "questions"), orderBy("createdAt", "desc"), limit(50));
      const snapshot = await getDocs(q);
      const fetched: Question[] = [];
      snapshot.forEach((doc) => fetched.push({ id: doc.id, ...doc.data() } as Question));
      setQuestions(fetched);
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Failed to fetch questions");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this question?")) return;
    try {
      await deleteDoc(doc(db, "questions", id));
      toast.success("Question deleted");
      setQuestions(prev => prev.filter(q => q.id !== id));
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error("Failed to delete");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rows = results.data as any[];
          let importedCount = 0;
          
          for (const row of rows) {
            // Expected CSV headers: text, option1, option2, option3, option4, correctOption (1-4), difficulty, marks
            if (!row.text || !row.option1 || !row.correctOption) continue;
            
            const options: QuestionOption[] = [
              { id: "A", text: row.option1 },
              { id: "B", text: row.option2 },
              { id: "C", text: row.option3 },
              { id: "D", text: row.option4 },
            ].filter(o => o.text); // Filter out empty options

            const correctOptionIndex = parseInt(row.correctOption) - 1;
            const correctAnswerId = options[correctOptionIndex]?.id || "A";

            const newQuestion = {
              type: "mcq",
              text: row.text,
              options,
              correctAnswer: correctAnswerId,
              difficulty: row.difficulty?.toLowerCase() || "medium",
              marks: parseFloat(row.marks) || 2,
              negativeMarks: parseFloat(row.negativeMarks) || 0.5,
              tags: row.tags ? row.tags.split(",") : [],
              isActive: true,
              createdBy: userProfile?.uid || "admin",
              createdAt: serverTimestamp(),
            };

            await addDoc(collection(db, "questions"), newQuestion);
            importedCount++;
          }
          
          toast.success(`Successfully imported ${importedCount} questions!`);
          fetchQuestions();
        } catch (error) {
          console.error("Import error:", error);
          toast.error("Failed to process CSV file.");
        }
        
        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = "";
      },
      error: (error) => {
        toast.error(`CSV Parsing Error: ${error.message}`);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-2">
            <FileText className="w-8 h-8 text-primary-500" />
            Question Bank
          </h1>
          <p className="text-muted-foreground mt-1">Manage questions and bulk import via CSV.</p>
        </div>
        <div className="flex items-center gap-3">
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
          />
          <button onClick={() => fileInputRef.current?.click()} className="btn-secondary">
            <Upload className="w-5 h-5" />
            Import CSV
          </button>
          <button className="btn-primary">
            <Plus className="w-5 h-5" />
            Add Question
          </button>
        </div>
      </div>

      <div className="card flex items-center gap-3 p-3">
        <Search className="w-5 h-5 text-muted-foreground ml-2" />
        <input 
          type="text" 
          placeholder="Search questions..." 
          className="bg-transparent border-none focus:outline-none flex-1 text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : (
        <div className="card divide-y divide-border overflow-hidden p-0">
          {questions.filter(q => q.text.toLowerCase().includes(searchTerm.toLowerCase())).map((q, i) => (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
              key={q.id} 
              className="p-4 hover:bg-muted/30 transition-colors flex justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex gap-2 mb-2">
                  <span className="badge-primary text-[10px] uppercase">{q.difficulty}</span>
                  <span className="badge-secondary text-[10px]">{q.marks} Marks</span>
                </div>
                <p className="text-sm font-medium mb-3">{q.text}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {q.options?.map((opt) => (
                    <div key={opt.id} className={`p-2 rounded border ${q.correctAnswer === opt.id ? 'bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400 font-medium' : 'border-border text-muted-foreground'}`}>
                      {opt.id}. {opt.text}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button className="p-2 text-muted-foreground hover:text-primary-500 rounded-lg hover:bg-muted">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(q.id)} className="p-2 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-red-500/10">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
          {questions.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No questions found in the bank. Import some via CSV!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
