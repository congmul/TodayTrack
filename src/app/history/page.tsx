import { HistoryView } from "@/components/history-view";
import { requireServerSession } from "@/lib/auth/session";
import { createWorkspaceService } from "@/lib/services/workspace-service";
import { redirect } from "next/navigation";

type HistoryPageProps = {
  searchParams: Promise<{
    project?: string;
  }>;
};

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
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
    <HistoryView project={context.selectedProject} projects={context.projects} />
  );
}
