import { TodayView } from "@/components/today-view";
import { requireServerSession } from "@/lib/auth/session";

type TodayPageProps = {
  searchParams: Promise<{
    account?: string;
    project?: string;
  }>;
};

export default async function TodayPage({ searchParams }: TodayPageProps) {
  await requireServerSession();
  const params = await searchParams;

  return <TodayView accountId={params.account} projectId={params.project} />;
}
