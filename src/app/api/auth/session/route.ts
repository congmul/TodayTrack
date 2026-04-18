import { NextRequest, NextResponse } from "next/server";
import {
  authSessionCookieName,
  getCachedSession,
} from "@/lib/auth/session-cache";

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
