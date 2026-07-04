"use client";

import { useState, useEffect } from "react";
import { Question } from "@/types";
import { getQuestions, deleteQuestion } from "@/lib/firebase/questions";
import { DataTable } from "@/components/ui/data-table";
import { Plus, Edit2, Trash2, Filter } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      const data = await getQuestions({
        type: selectedType === "all" ? undefined : selectedType,
        difficulty: selectedDifficulty === "all" ? undefined : selectedDifficulty,
      });
      setQuestions(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load questions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [selectedType, selectedDifficulty]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this question?")) {
      try {
        await deleteQuestion(id);
        toast.success("Question deleted successfully");
        fetchQuestions();
      } catch (error) {
        console.error(error);
        toast.error("Failed to delete question");
      }
    }
  };

  const filteredQuestions = questions.filter((q) =>
    q.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "text-green-500 bg-green-500/10";
      case "medium": return "text-yellow-500 bg-yellow-500/10";
      case "hard": return "text-red-500 bg-red-500/10";
      default: return "text-gray-500 bg-gray-500/10";
    }
  };

  const formatQuestionType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const columns = [
    { 
      header: "Question", 
      accessor: (row: Question) => (
        <div className="max-w-md line-clamp-2" dangerouslySetInnerHTML={{ __html: row.text }} />
      )
    },
    { 
      header: "Type", 
      accessor: (row: Question) => (
        <span className="text-muted-foreground whitespace-nowrap">{formatQuestionType(row.type)}</span>
      ) 
    },
    {
      header: "Difficulty",
      accessor: (row: Question) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize whitespace-nowrap ${getDifficultyColor(row.difficulty)}`}>
          {row.difficulty}
        </span>
      )
    },
    { 
      header: "Marks", 
      accessor: (row: Question) => (
        <span className="text-muted-foreground whitespace-nowrap">+{row.marks} / -{row.negativeMarks || 0}</span>
      ) 
    },
    {
      header: "Actions",
      accessor: (row: Question) => (
        <div className="flex items-center gap-2">
          <Link href={`/super-admin/assessments/question-bank/${row.id}`} className="p-1.5 hover:bg-muted rounded-md text-blue-500">
            <Edit2 className="w-4 h-4" />
          </Link>
          <button onClick={() => handleDelete(row.id)} className="p-1.5 hover:bg-muted rounded-md text-red-500">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
      className: "text-right"
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display">Question Bank</h1>
          <p className="text-muted-foreground">Manage all questions for exams and practice tests.</p>
        </div>
        <Link
          href="/super-admin/assessments/question-bank/new"
          className="btn-primary flex items-center gap-2 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Add Question</span>
        </Link>
      </div>

      <DataTable
        data={filteredQuestions}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Search question text..."
        onSearch={setSearchQuery}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 bg-muted/50">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select 
                value={selectedType} 
                onChange={e => setSelectedType(e.target.value)}
                className="bg-transparent border-none text-sm outline-none text-foreground w-32"
              >
                <option value="all">All Types</option>
                <option value="single">Single Choice</option>
                <option value="multiple">Multiple Choice</option>
                <option value="true_false">True / False</option>
                <option value="paragraph">Paragraph</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 bg-muted/50">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select 
                value={selectedDifficulty} 
                onChange={e => setSelectedDifficulty(e.target.value)}
                className="bg-transparent border-none text-sm outline-none text-foreground w-32"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
        }
      />
    </div>
  );
}
