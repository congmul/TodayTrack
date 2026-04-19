import { ProjectCreateForm } from "@/components/project-create-form";
import { requireServerSession } from "@/lib/auth/session";
import { createWorkspaceService } from "@/lib/services/workspace-service";

export default async function NewProjectPage() {
  const session = await requireServerSession();
  const workspaceService = createWorkspaceService();
  const context = await workspaceService.getWorkspaceContext(
    session.user.id,
    session.user.selectedProjectId,
  );

  return (
    <ProjectCreateForm
      projects={context.projects}
      selectedProjectId={context.selectedProject?.id}
    />
  );
}
