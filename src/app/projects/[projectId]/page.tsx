import { ProjectDetailView } from "@/components/project-detail-view";
import { requireServerSession } from "@/lib/auth/session";
import { createProjectService, ProjectServiceError } from "@/lib/services/project-service";
import { createWorkspaceService } from "@/lib/services/workspace-service";

type ProjectDetailPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const session = await requireServerSession();
  const { projectId } = await params;
  const workspaceService = createWorkspaceService();
  const context = await workspaceService.getWorkspaceContext(
    session.user.id,
    projectId,
  );
  const projectService = createProjectService();
  const projects = await projectService.listProjects(
    session.user.id,
    context.selectedProject?.id,
  );
  const project = await projectService
    .getProject(projectId, session.user.id, context.selectedProject?.id)
    .catch((error: unknown) => {
      if (error instanceof ProjectServiceError) {
        return null;
      }

      throw error;
    });

  return (
    <ProjectDetailView
      project={project}
      projects={projects}
      selectedProjectName={context.selectedProject?.name}
    />
  );
}
