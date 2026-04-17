import { ProjectDetailView } from "@/components/project-detail-view";

type ProjectDetailPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { projectId } = await params;

  return <ProjectDetailView projectId={projectId} />;
}
