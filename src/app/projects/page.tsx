import { ProjectsView } from "@/components/projects-view";
import { requireServerSession } from "@/lib/auth/session";

type ProjectsPageProps = {
  searchParams: Promise<{
    project?: string;
  }>;
};

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const session = await requireServerSession();
  const params = await searchParams;

  return (
    <ProjectsView
      projectId={params.project ?? session.user.selectedProjectId}
    />
  );
}
