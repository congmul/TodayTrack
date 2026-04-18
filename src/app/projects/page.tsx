import { ProjectsView } from "@/components/projects-view";
import { requireServerSession } from "@/lib/auth/session";

type ProjectsPageProps = {
  searchParams: Promise<{
    account?: string;
    project?: string;
  }>;
};

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  await requireServerSession();
  const params = await searchParams;

  return <ProjectsView accountId={params.account} projectId={params.project} />;
}
