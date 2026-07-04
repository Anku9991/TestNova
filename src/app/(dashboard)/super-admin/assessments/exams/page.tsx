"use client";

import { useState, useEffect } from "react";
import { Exam } from "@/types";
import { getExams, deleteExam } from "@/lib/firebase/exams";
import { DataTable } from "@/components/ui/data-table";
import { Plus, Edit2, Trash2, Filter } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const fetchExams = async () => {
    try {
      setIsLoading(true);
      const data = await getExams({
        category: selectedCategory === "all" ? undefined : selectedCategory,
      });
      setExams(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load exams");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [selectedCategory]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this exam?")) {
      try {
        await deleteExam(id);
        toast.success("Exam deleted successfully");
        fetchExams();
      } catch (error) {
        console.error(error);
        toast.error("Failed to delete exam");
      }
    }
  };

  const filteredExams = exams.filter((e) =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "text-green-500 bg-green-500/10";
      case "medium": return "text-yellow-500 bg-yellow-500/10";
      case "hard": return "text-red-500 bg-red-500/10";
      case "mixed": return "text-purple-500 bg-purple-500/10";
      default: return "text-gray-500 bg-gray-500/10";
    }
  };

  const columns = [
    { header: "Exam Title", accessor: "title" as keyof Exam },
    { 
      header: "Category", 
      accessor: (row: Exam) => (
        <span className="capitalize">{row.category}</span>
      )
    },
    {
      header: "Duration",
      accessor: (row: Exam) => (
        <span className="text-muted-foreground whitespace-nowrap">{row.duration} mins</span>
      )
    },
    {
      header: "Marks",
      accessor: (row: Exam) => (
        <span className="text-muted-foreground whitespace-nowrap">{row.totalMarks} (Pass: {row.passingMarks || 0})</span>
      )
    },
    {
      header: "Difficulty",
      accessor: (row: Exam) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize whitespace-nowrap ${getDifficultyColor(row.difficulty)}`}>
          {row.difficulty}
        </span>
      )
    },
    {
      header: "Status",
      accessor: (row: Exam) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.isPublished ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
          {row.isPublished ? 'Published' : 'Draft'}
        </span>
      )
    },
    {
      header: "Actions",
      accessor: (row: Exam) => (
        <div className="flex items-center gap-2">
          <Link href={`/super-admin/assessments/exams/${row.id}`} className="p-1.5 hover:bg-muted rounded-md text-blue-500">
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
          <h1 className="text-2xl font-bold font-display">Exam Management</h1>
          <p className="text-muted-foreground">Manage exams, mock tests, and practice tests.</p>
        </div>
        <Link
          href="/super-admin/assessments/exams/new"
          className="btn-primary flex items-center gap-2 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Create Exam</span>
        </Link>
      </div>

      <DataTable
        data={filteredExams}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Search exams by title..."
        onSearch={setSearchQuery}
        actions={
          <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 bg-muted/50">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select 
              value={selectedCategory} 
              onChange={e => setSelectedCategory(e.target.value)}
              className="bg-transparent border-none text-sm outline-none text-foreground w-32"
            >
              <option value="all">All Categories</option>
              <option value="mock">Mock Test</option>
              <option value="live">Live Test</option>
              <option value="practice">Practice Test</option>
            </select>
          </div>
        }
      />
    </div>
  );
}
