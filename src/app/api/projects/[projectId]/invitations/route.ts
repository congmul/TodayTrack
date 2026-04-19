import { NextResponse } from "next/server";
import { getApiSessionUser } from "@/lib/auth/api-user";
import {
  createProjectService,
  ProjectServiceError,
} from "@/lib/services/project-service";

type InvitationParams = {
  params: Promise<{
    projectId: string;
  }>;
};

export async function POST(request: Request, { params }: InvitationParams) {
  const user = await getApiSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { projectId } = await params;
  const service = createProjectService();

  try {
    const body = await request.json();
    const invitation = await service.inviteMember(projectId, user.id, {
      email: body?.email,
    });

    return NextResponse.json({ invitation }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Request body must be valid JSON." },
        { status: 400 },
      );
    }

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
