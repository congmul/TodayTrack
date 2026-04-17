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
