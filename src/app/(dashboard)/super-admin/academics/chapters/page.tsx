"use client";

import { useState, useEffect } from "react";
import { Chapter, Subject } from "@/types";
import { getChapters, deleteChapter } from "@/lib/firebase/chapters";
import { getSubjects } from "@/lib/firebase/subjects";
import { DataTable } from "@/components/ui/data-table";
import { Plus, Edit2, Trash2, Filter } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function ChaptersPage() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [chaptersData, subjectsData] = await Promise.all([
        getChapters(),
        getSubjects()
      ]);
      setChapters(chaptersData);
      setSubjects(subjectsData);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this chapter?")) {
      try {
        await deleteChapter(id);
        toast.success("Chapter deleted successfully");
        fetchData();
      } catch (error) {
        console.error(error);
        toast.error("Failed to delete chapter");
      }
    }
  };

  const filteredChapters = chapters.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === "all" || c.subjectId === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const getSubjectTitle = (subjectId: string) => {
    return subjects.find(s => s.id === subjectId)?.title || "Unknown Subject";
  };

  const columns = [
    { header: "Chapter Sequence", accessor: "sequence" as keyof Chapter },
    { header: "Chapter Title", accessor: "title" as keyof Chapter },
    { 
      header: "Subject", 
      accessor: (row: Chapter) => (
        <span className="text-muted-foreground">{getSubjectTitle(row.subjectId)}</span>
      ) 
    },
    {
      header: "Status",
      accessor: (row: Chapter) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.isLocked ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
          {row.isLocked ? 'Locked' : 'Unlocked'}
        </span>
      )
    },
    {
      header: "Actions",
      accessor: (row: Chapter) => (
        <div className="flex items-center gap-2">
          <Link href={`/super-admin/academics/chapters/${row.id}`} className="p-1.5 hover:bg-muted rounded-md text-blue-500">
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
          <h1 className="text-2xl font-bold font-display">Chapter Management</h1>
          <p className="text-muted-foreground">Manage chapters and their sequences.</p>
        </div>
        <Link
          href="/super-admin/academics/chapters/new"
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Chapter</span>
        </Link>
      </div>

      <DataTable
        data={filteredChapters}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Search chapters..."
        onSearch={setSearchQuery}
        actions={
          <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 bg-muted/50">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select 
              value={selectedSubject} 
              onChange={e => setSelectedSubject(e.target.value)}
              className="bg-transparent border-none text-sm outline-none text-foreground w-40"
            >
              <option value="all">All Subjects</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </div>
        }
      />
    </div>
  );
}
