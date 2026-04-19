import { HistoryView } from "@/components/history-view";
import { requireServerSession } from "@/lib/auth/session";
import { createProjectService } from "@/lib/services/project-service";
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
    return null;
  }

  const projectService = createProjectService();
  const projects = await projectService.listProjects(
    session.user.id,
    context.selectedProject.id,
  );
  const selectedProject =
    projects.find((project) => project.id === context.selectedProject?.id) ??
    projects[0];

  return <HistoryView project={selectedProject} />;
}
