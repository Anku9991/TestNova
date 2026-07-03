export default function ExamLayout({ children }: { children: React.ReactNode }) {
  // Full-screen layout — no sidebar/navbar for distraction-free exam
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
