import { ProjectsView } from "@/components/projects-view";
import { requireServerSession } from "@/lib/auth/session";
import { createProjectService } from "@/lib/services/project-service";
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
  const projectService = createProjectService();
  const projects = await projectService.listProjects(
    session.user.id,
    context.selectedProject?.id,
  );

  return (
    <ProjectsView projects={projects} selectedProjectId={context.selectedProject?.id} />
  );
}
