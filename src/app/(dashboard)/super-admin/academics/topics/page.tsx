"use client";

import { useState, useEffect } from "react";
import { Topic, Chapter, Subject } from "@/types";
import { getTopics, deleteTopic } from "@/lib/firebase/topics";
import { getChapters } from "@/lib/firebase/chapters";
import { getSubjects } from "@/lib/firebase/subjects";
import { DataTable } from "@/components/ui/data-table";
import { Plus, Edit2, Trash2, Filter } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedChapter, setSelectedChapter] = useState<string>("all");

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [topicsData, chaptersData, subjectsData] = await Promise.all([
        getTopics(),
        getChapters(),
        getSubjects()
      ]);
      setTopics(topicsData);
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
    if (confirm("Are you sure you want to delete this topic?")) {
      try {
        await deleteTopic(id);
        toast.success("Topic deleted successfully");
        fetchData();
      } catch (error) {
        console.error(error);
        toast.error("Failed to delete topic");
      }
    }
  };

  // When subject changes, reset chapter filter
  useEffect(() => {
    setSelectedChapter("all");
  }, [selectedSubject]);

  const filteredChapters = selectedSubject === "all" 
    ? chapters 
    : chapters.filter(c => c.subjectId === selectedSubject);

  const filteredTopics = topics.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesChapter = selectedChapter === "all" || t.chapterId === selectedChapter;
    
    // If a subject is selected but no chapter is selected, filter topics by all chapters in that subject
    const matchesSubject = selectedSubject === "all" || filteredChapters.some(c => c.id === t.chapterId);

    return matchesSearch && matchesChapter && matchesSubject;
  });

  const getChapterTitle = (chapterId: string) => {
    return chapters.find(c => c.id === chapterId)?.title || "Unknown Chapter";
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "text-green-500 bg-green-500/10";
      case "medium": return "text-yellow-500 bg-yellow-500/10";
      case "hard": return "text-red-500 bg-red-500/10";
      default: return "text-gray-500 bg-gray-500/10";
    }
  };

  const columns = [
    { header: "Topic Title", accessor: "title" as keyof Topic },
    { 
      header: "Chapter", 
      accessor: (row: Topic) => (
        <span className="text-muted-foreground">{getChapterTitle(row.chapterId)}</span>
      ) 
    },
    {
      header: "Difficulty",
      accessor: (row: Topic) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getDifficultyColor(row.difficulty)}`}>
          {row.difficulty}
        </span>
      )
    },
    { 
      header: "Est. Time", 
      accessor: (row: Topic) => (
        <span className="text-muted-foreground">{row.estimatedTime ? `${row.estimatedTime} min` : "N/A"}</span>
      ) 
    },
    {
      header: "Actions",
      accessor: (row: Topic) => (
        <div className="flex items-center gap-2">
          <Link href={`/super-admin/academics/topics/${row.id}`} className="p-1.5 hover:bg-muted rounded-md text-blue-500">
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
          <h1 className="text-2xl font-bold font-display">Topic Management</h1>
          <p className="text-muted-foreground">Manage topics within chapters.</p>
        </div>
        <Link
          href="/super-admin/academics/topics/new"
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Topic</span>
        </Link>
      </div>

      <DataTable
        data={filteredTopics}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Search topics..."
        onSearch={setSearchQuery}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 bg-muted/50">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select 
                value={selectedSubject} 
                onChange={e => setSelectedSubject(e.target.value)}
                className="bg-transparent border-none text-sm outline-none text-foreground w-32"
              >
                <option value="all">All Subjects</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 bg-muted/50">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select 
                value={selectedChapter} 
                onChange={e => setSelectedChapter(e.target.value)}
                className="bg-transparent border-none text-sm outline-none text-foreground w-32"
                disabled={selectedSubject === "all"}
              >
                <option value="all">All Chapters</option>
                {filteredChapters.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
          </div>
        }
      />
    </div>
  );
}
