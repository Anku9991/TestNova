"use client";

import { useState, useEffect } from "react";
import { Subject, Course } from "@/types";
import { getSubjects, deleteSubject } from "@/lib/firebase/subjects";
import { getCourses } from "@/lib/firebase/courses";
import { DataTable } from "@/components/ui/data-table";
import { Plus, Edit2, Trash2, Filter } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [subjectsData, coursesData] = await Promise.all([
        getSubjects(),
        getCourses()
      ]);
      setSubjects(subjectsData);
      setCourses(coursesData);
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
    if (confirm("Are you sure you want to delete this subject?")) {
      try {
        await deleteSubject(id);
        toast.success("Subject deleted successfully");
        fetchData();
      } catch (error) {
        console.error(error);
        toast.error("Failed to delete subject");
      }
    }
  };

  const filteredSubjects = subjects.filter((s) => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = selectedCourse === "all" || s.courseId === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  const getCourseTitle = (courseId: string) => {
    return courses.find(c => c.id === courseId)?.title || "Unknown Course";
  };

  const columns = [
    { header: "Subject Title", accessor: "title" as keyof Subject },
    { 
      header: "Course", 
      accessor: (row: Subject) => (
        <span className="text-muted-foreground">{getCourseTitle(row.courseId)}</span>
      ) 
    },
    {
      header: "Actions",
      accessor: (row: Subject) => (
        <div className="flex items-center gap-2">
          <Link href={`/super-admin/academics/subjects/${row.id}`} className="p-1.5 hover:bg-muted rounded-md text-blue-500">
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
          <h1 className="text-2xl font-bold font-display">Subject Management</h1>
          <p className="text-muted-foreground">Manage subjects across all courses.</p>
        </div>
        <Link
          href="/super-admin/academics/subjects/new"
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subject</span>
        </Link>
      </div>

      <DataTable
        data={filteredSubjects}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Search subjects..."
        onSearch={setSearchQuery}
        actions={
          <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 bg-muted/50">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select 
              value={selectedCourse} 
              onChange={e => setSelectedCourse(e.target.value)}
              className="bg-transparent border-none text-sm outline-none text-foreground w-40"
            >
              <option value="all">All Courses</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
        }
      />
    </div>
  );
}
