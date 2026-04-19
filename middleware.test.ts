import { NextRequest } from "next/server";
import { createSessionToken } from "@/lib/auth/session-token";
import { middleware } from "./middleware";

describe("api auth middleware", () => {
  it("rejects requests without a bearer token", async () => {
    const response = await middleware(
      new NextRequest("http://localhost:3000/api/projects/project_123"),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Bearer token is required.",
    });
  });

  it("accepts requests signed by the backend", async () => {
    const token = await createSessionToken({
      user: {
        id: "google:google-user-123",
        provider: "google",
        providerUserId: "google-user-123",
        email: "hyun@gmail.com",
        displayName: "J. Hyun",
        avatarUrl: null,
        lastLoginAt: "2026-04-18T00:00:00.000Z",
        createdAt: "2026-04-18T00:00:00.000Z",
        updatedAt: "2026-04-18T00:00:00.000Z",
      },
      expiresAt: Date.now() + 60_000,
    });

    const response = await middleware(
      new NextRequest("http://localhost:3000/api/projects/project_123", {
        headers: {
          authorization: `Bearer ${token}`,
        },
      }),
    );

    expect(response.status).toBe(200);
  });
});
