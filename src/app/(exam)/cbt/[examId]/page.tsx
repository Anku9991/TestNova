import { CBTEngine } from "@/components/cbt/cbt-engine";

interface CBTPageProps {
  params: Promise<{ examId: string }>;
}

export default async function CBTPage({ params }: CBTPageProps) {
  const { examId } = await params;
  // Duration is fetched directly from Firestore by CBTEngine — no hardcoding needed
  return <CBTEngine examId={examId} />;
}
