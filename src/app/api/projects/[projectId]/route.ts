import { NextResponse } from "next/server";
import {
  ProjectServiceError,
  createProjectService,
} from "@/lib/services/project-service";

type ProjectParams = {
  params: Promise<{
    projectId: string;
  }>;
};

export async function GET(_: Request, { params }: ProjectParams) {
  const { projectId } = await params;
  const service = createProjectService();

  try {
    const project = await service.getProject(projectId);
    return NextResponse.json({ project });
  } catch (error) {
    if (error instanceof ProjectServiceError) {
      const status =
        error.code === "PROJECT_NOT_FOUND"
          ? 404
          : error.code === "INVALID_INPUT"
            ? 400
            : 500;

      return NextResponse.json({ error: error.message }, { status });
    }

    console.error(error);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, { params }: ProjectParams) {
  const { projectId } = await params;
  const service = createProjectService();

  try {
    const body = await request.json();
    const project = await service.updateProject(projectId, {
      name: body?.name,
      description: body?.description,
      type: body?.type,
      status: body?.status,
      alertEnabled: body?.alertEnabled,
    });

    return NextResponse.json({ project });
  } catch (error) {
    return mapProjectError(error);
  }
}

export async function DELETE(_: Request, { params }: ProjectParams) {
  const { projectId } = await params;
  const service = createProjectService();

  try {
    await service.deleteProject(projectId);
    return new NextResponse(null, { status: 204 });
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
      ACCOUNT_NOT_FOUND: 404,
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
