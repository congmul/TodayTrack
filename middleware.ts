import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/auth/session-token";

export async function middleware(request: NextRequest) {
  const authorizationHeader = request.headers.get("authorization");

  if (!authorizationHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Bearer token is required." },
      { status: 401 },
    );
  }

  const token = authorizationHeader.slice("Bearer ".length).trim();
  const payload = await verifySessionToken(token);

  if (!payload) {
    return NextResponse.json(
      { error: "Bearer token is invalid or expired." },
      { status: 401 },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/projects/:path*"],
};
