import { ProjectDetailView } from "@/components/project-detail-view";
import { requireServerSession } from "@/lib/auth/session";

type ProjectDetailPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  await requireServerSession();
  const { projectId } = await params;

  return <ProjectDetailView projectId={projectId} />;
}
