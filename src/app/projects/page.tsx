import { ProjectsView } from "@/components/projects-view";
import { requireServerSession } from "@/lib/auth/session";
import { createWorkspaceService } from "@/lib/services/workspace-service";

type ProjectsPageProps = {
  searchParams: Promise<{
    project?: string;
  }>;
};

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const session = await requireServerSession();
  const params = await searchParams;
  const workspaceService = createWorkspaceService();
  const context = await workspaceService.getWorkspaceContext(
    session.user.id,
    params.project,
  );

  return (
    <ProjectsView
      projects={context.projects}
      selectedProjectId={context.selectedProject?.id}
    />
  );
}
