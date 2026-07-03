import { CBTEngine } from "@/components/cbt/cbt-engine";

interface CBTPageProps {
  params: Promise<{ examId: string }>;
}

export default async function CBTPage({ params }: CBTPageProps) {
  const { examId } = await params;
  return <CBTEngine examId={examId} totalDurationMinutes={60} />;
}
