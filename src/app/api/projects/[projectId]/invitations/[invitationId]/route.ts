import { NextResponse } from "next/server";
import { getApiSessionUser } from "@/lib/auth/api-user";
import {
  createProjectService,
  ProjectServiceError,
} from "@/lib/services/project-service";

type InvitationDeleteParams = {
  params: Promise<{
    projectId: string;
    invitationId: string;
  }>;
};

export async function DELETE(_: Request, { params }: InvitationDeleteParams) {
  const user = await getApiSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { projectId, invitationId } = await params;
  const service = createProjectService();

  try {
    await service.removeMember(projectId, user.id, invitationId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof ProjectServiceError) {
      const statusMap: Record<ProjectServiceError["code"], number> = {
        INVALID_INPUT: 400,
        PROJECT_NOT_FOUND: 404,
        PROJECT_NAME_CONFLICT: 409,
        PROJECT_ACCESS_DENIED: 403,
        PROJECT_DELETE_FORBIDDEN: 403,
        PROJECT_INVITE_CONFLICT: 409,
        PROJECT_MEMBER_NOT_FOUND: 404,
      };

      return NextResponse.json(
        { error: error.message },
        { status: statusMap[error.code] ?? 500 },
      );
    }

    console.error(error);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
