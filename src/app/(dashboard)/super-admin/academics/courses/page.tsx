"use client";

import { useState, useEffect } from "react";
import { Course } from "@/types";
import { getCourses, deleteCourse } from "@/lib/firebase/courses";
import { DataTable } from "@/components/ui/data-table";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const data = await getCourses();
      setCourses(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load courses");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      try {
        await deleteCourse(id);
        toast.success("Course deleted successfully");
        fetchCourses();
      } catch (error) {
        console.error(error);
        toast.error("Failed to delete course");
      }
    }
  };

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    { header: "Title", accessor: "title" as keyof Course },
    { header: "Price (₹)", accessor: "price" as keyof Course },
    {
      header: "Status",
      accessor: (row: Course) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.isPublished ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
          {row.isPublished ? 'Published' : 'Draft'}
        </span>
      )
    },
    {
      header: "Actions",
      accessor: (row: Course) => (
        <div className="flex items-center gap-2">
          <Link href={`/super-admin/academics/courses/${row.id}`} className="p-1.5 hover:bg-muted rounded-md text-blue-500">
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
          <h1 className="text-2xl font-bold font-display">Course Management</h1>
          <p className="text-muted-foreground">Manage all courses and their details.</p>
        </div>
        <Link
          href="/super-admin/academics/courses/new"
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Course</span>
        </Link>
      </div>

      <DataTable
        data={filteredCourses}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Search courses by title..."
        onSearch={setSearchQuery}
      />
    </div>
  );
}
