import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { createWorkspaceService } from "@/lib/services/workspace-service";

export default async function Home() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
    return null;
  }

  const workspaceService = createWorkspaceService();
  const landing = await workspaceService.resolveLandingForUser(session.user.id);

  redirect(landing.path);
}
