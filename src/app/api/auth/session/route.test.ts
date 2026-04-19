import { GET, PATCH } from "@/app/api/auth/session/route";
import { NextRequest } from "next/server";

const mockGetCachedSession = vi.fn();
const mockDeleteCachedSession = vi.fn();
const mockCreateUserSession = vi.fn();
const mockApplySessionCookie = vi.fn();
const mockUpdateSelectedProject = vi.fn();

vi.mock("@/lib/auth/session-cache", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth/session-cache")>(
    "@/lib/auth/session-cache",
  );

  return {
    ...actual,
    getCachedSession: (...args: unknown[]) => mockGetCachedSession(...args),
    deleteCachedSession: (...args: unknown[]) => mockDeleteCachedSession(...args),
  };
});

vi.mock("@/lib/auth/session", () => ({
  createUserSession: (...args: unknown[]) => mockCreateUserSession(...args),
  applySessionCookie: (...args: unknown[]) => mockApplySessionCookie(...args),
}));

vi.mock("@/lib/services/workspace-service", async () => {
  const actual = await vi.importActual<typeof import("@/lib/services/workspace-service")>(
    "@/lib/services/workspace-service",
  );

  return {
    ...actual,
    createWorkspaceService: () => ({
      updateSelectedProject: mockUpdateSelectedProject,
    }),
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
        id: "microsoft:user-123",
        provider: "microsoft",
        providerUserId: "user-123",
        selectedProjectId: "project_task_home",
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

  it("updates the selected project and refreshes the session", async () => {
    mockGetCachedSession.mockReturnValue({
      token: "session-token",
      expiresAt: Date.now() + 1000,
      user: {
        id: "microsoft:user-123",
        provider: "microsoft",
        providerUserId: "user-123",
        selectedProjectId: null,
        email: "hyun@example.com",
        displayName: "J. Hyun",
        avatarUrl: null,
        lastLoginAt: "2026-04-18T08:00:00.000Z",
        createdAt: "2026-04-18T08:00:00.000Z",
        updatedAt: "2026-04-18T08:00:00.000Z",
      },
    });
    mockUpdateSelectedProject.mockResolvedValue({
      id: "microsoft:user-123",
      provider: "microsoft",
      providerUserId: "user-123",
      selectedProjectId: "project_task_home",
      email: "hyun@example.com",
      displayName: "J. Hyun",
      avatarUrl: null,
      lastLoginAt: "2026-04-18T08:00:00.000Z",
      createdAt: "2026-04-18T08:00:00.000Z",
      updatedAt: "2026-04-18T08:00:00.000Z",
    });
    mockCreateUserSession.mockResolvedValue({
      token: "next-token",
      expiresAt: Date.now() + 1000,
      user: {
        id: "microsoft:user-123",
        provider: "microsoft",
        providerUserId: "user-123",
        selectedProjectId: "project_task_home",
        email: "hyun@example.com",
        displayName: "J. Hyun",
        avatarUrl: null,
        lastLoginAt: "2026-04-18T08:00:00.000Z",
        createdAt: "2026-04-18T08:00:00.000Z",
        updatedAt: "2026-04-18T08:00:00.000Z",
      },
    });

    const response = await PATCH(
      new NextRequest("http://localhost:3000/api/auth/session", {
        method: "PATCH",
        headers: {
          cookie: "todaytrack_session=session-token",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          projectId: "project_task_home",
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(mockUpdateSelectedProject).toHaveBeenCalledWith(
      "microsoft:user-123",
      "project_task_home",
    );
    expect(mockApplySessionCookie).toHaveBeenCalledWith(
      expect.anything(),
      "next-token",
    );
    expect(mockDeleteCachedSession).toHaveBeenCalledWith("session-token");
  });
});
