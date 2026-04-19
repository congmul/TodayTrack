import { NextRequest, NextResponse } from "next/server";
import {
  authSessionCookieName,
  deleteCachedSession,
  getCachedSession,
} from "@/lib/auth/session-cache";
import { applySessionCookie, createUserSession } from "@/lib/auth/session";
import {
  createWorkspaceService,
  WorkspaceServiceError,
} from "@/lib/services/workspace-service";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(authSessionCookieName)?.value;
  const session = getCachedSession(token);

  if (!session) {
    return NextResponse.json(
      { error: "Not authenticated." },
      {
        status: 401,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  return NextResponse.json(
    {
      token: session.token,
      user: session.user,
      expiresAt: new Date(session.expiresAt).toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function PATCH(request: NextRequest) {
  const token = request.cookies.get(authSessionCookieName)?.value;
  const session = getCachedSession(token);

  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const workspaceService = createWorkspaceService();
    const user = await workspaceService.updateSelectedProject(
      session.user.id,
      body?.projectId,
    );
    const nextSession = await createUserSession(user);
    const response = NextResponse.json({
      token: nextSession.token,
      user: nextSession.user,
      expiresAt: new Date(nextSession.expiresAt).toISOString(),
    });

    applySessionCookie(response, nextSession.token);
    deleteCachedSession(token);

    return response;
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Request body must be valid JSON." },
        { status: 400 },
      );
    }

    if (error instanceof WorkspaceServiceError) {
      const status =
        error.code === "USER_NOT_FOUND" || error.code === "PROJECT_NOT_FOUND"
          ? 404
          : 400;

      return NextResponse.json({ error: error.message }, { status });
    }

    console.error(error);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
