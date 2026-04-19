import { TodayView } from "@/components/today-view";
import { requireServerSession } from "@/lib/auth/session";

type TodayPageProps = {
  searchParams: Promise<{
    project?: string;
  }>;
};

export default async function TodayPage({ searchParams }: TodayPageProps) {
  const session = await requireServerSession();
  const params = await searchParams;

  return (
    <TodayView
      projectId={params.project ?? session.user.selectedProjectId}
    />
  );
}
