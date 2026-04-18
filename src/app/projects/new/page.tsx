import { ProjectCreateForm } from "@/components/project-create-form";
import { requireServerSession } from "@/lib/auth/session";

export default async function NewProjectPage() {
  await requireServerSession();

  return <ProjectCreateForm />;
}
