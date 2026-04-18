import { GET } from "@/app/api/auth/session/route";
import { NextRequest } from "next/server";

const mockGetCachedSession = vi.fn();

vi.mock("@/lib/auth/session-cache", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth/session-cache")>(
    "@/lib/auth/session-cache",
  );

  return {
    ...actual,
    getCachedSession: (...args: unknown[]) => mockGetCachedSession(...args),
  };
});

describe("auth/session route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the cached session payload for the frontend", async () => {
    mockGetCachedSession.mockReturnValue({
      token: "session-token",
      expiresAt: Date.now() + 1000,
      user: {
        id: "azure:azure-user-123",
        provider: "azure",
        providerUserId: "azure-user-123",
        email: "hyun@example.com",
        displayName: "J. Hyun",
        avatarUrl: null,
        lastLoginAt: "2026-04-18T08:00:00.000Z",
        createdAt: "2026-04-18T08:00:00.000Z",
        updatedAt: "2026-04-18T08:00:00.000Z",
      },
    });

    const response = await GET(
      new NextRequest("http://localhost:3000/api/auth/session", {
        headers: {
          cookie: "todaytrack_session=session-token",
        },
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        token: "session-token",
        user: expect.objectContaining({
          displayName: "J. Hyun",
        }),
      }),
    );
  });

  it("returns 401 without an active cached session", async () => {
    mockGetCachedSession.mockReturnValue(null);

    const response = await GET(
      new NextRequest("http://localhost:3000/api/auth/session"),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Not authenticated.",
    });
  });
});
