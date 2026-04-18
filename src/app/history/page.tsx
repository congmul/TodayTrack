import { HistoryView } from "@/components/history-view";
import { requireServerSession } from "@/lib/auth/session";

type HistoryPageProps = {
  searchParams: Promise<{
    account?: string;
    project?: string;
  }>;
};

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  await requireServerSession();
  const params = await searchParams;

  return <HistoryView accountId={params.account} projectId={params.project} />;
}
