import { NextResponse } from "next/server";
import {
  ProjectServiceError,
  createProjectService,
} from "@/lib/services/project-service";

type AccountParams = {
  params: Promise<{
    accountId: string;
  }>;
};

export async function GET(_: Request, { params }: AccountParams) {
  const { accountId } = await params;
  const service = createProjectService();

  try {
    const projects = await service.listProjects(accountId);
    return NextResponse.json({ projects });
  } catch (error) {
    return mapProjectError(error);
  }
}

export async function POST(request: Request, { params }: AccountParams) {
  const { accountId } = await params;
  const service = createProjectService();

  try {
    const body = await request.json();
    const project = await service.createProject({
      accountId,
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
    switch (error.code) {
      case "INVALID_INPUT":
        return NextResponse.json({ error: error.message }, { status: 400 });
      case "ACCOUNT_NOT_FOUND":
        return NextResponse.json({ error: error.message }, { status: 404 });
      case "PROJECT_NAME_CONFLICT":
        return NextResponse.json({ error: error.message }, { status: 409 });
      default:
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  console.error(error);

  return NextResponse.json(
    { error: "Internal server error." },
    { status: 500 },
  );
}
