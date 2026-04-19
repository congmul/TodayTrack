import { TodayView } from "@/components/today-view";
import { requireServerSession } from "@/lib/auth/session";
import { createWorkspaceService } from "@/lib/services/workspace-service";
import { redirect } from "next/navigation";

type TodayPageProps = {
  searchParams: Promise<{
    project?: string;
  }>;
};

export default async function TodayPage({ searchParams }: TodayPageProps) {
  const session = await requireServerSession();
  const params = await searchParams;
  const workspaceService = createWorkspaceService();
  const context = await workspaceService.getWorkspaceContext(
    session.user.id,
    params.project,
  );

  if (!context.hasProjects || !context.selectedProject) {
    redirect("/projects");
  }

  return (
    <TodayView project={context.selectedProject} projects={context.projects} />
  );
}
