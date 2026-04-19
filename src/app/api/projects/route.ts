import { NextResponse } from "next/server";
import { getApiSessionUser } from "@/lib/auth/api-user";
import {
  ProjectServiceError,
  createProjectService,
} from "@/lib/services/project-service";

export async function GET() {
  const user = await getApiSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const service = createProjectService();

  try {
    const projects = await service.listProjects(user.id);
    return NextResponse.json({ projects });
  } catch (error) {
    return mapProjectError(error);
  }
}

export async function POST(request: Request) {
  const user = await getApiSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const service = createProjectService();

  try {
    const body = await request.json();
    const project = await service.createProject(user.id, {
      name: body?.name,
      description: body?.description,
      type: body?.type,
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    return mapProjectError(error);
  }
}

function mapProjectError(error: unknown) {
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
