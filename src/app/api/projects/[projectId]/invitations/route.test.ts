import { POST } from "@/app/api/projects/[projectId]/invitations/route";
import { ProjectServiceError } from "@/lib/services/project-service";

const mockInviteMember = vi.fn();
const mockGetApiSessionUser = vi.fn();

vi.mock("@/lib/services/project-service", async () => {
  const actual = await vi.importActual<typeof import("@/lib/services/project-service")>(
    "@/lib/services/project-service",
  );

  return {
    ...actual,
    createProjectService: () => ({
      inviteMember: mockInviteMember,
    }),
  };
});

vi.mock("@/lib/auth/api-user", () => ({
  getApiSessionUser: (...args: unknown[]) => mockGetApiSessionUser(...args),
}));

describe("projects/[projectId]/invitations route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetApiSessionUser.mockResolvedValue({
      id: "microsoft:user-123",
      selectedProjectId: "project_123",
    });
  });

  it("creates an invitation for the signed-in user", async () => {
    mockInviteMember.mockResolvedValue({
      id: "invite_1",
      invitedEmail: "friend@example.com",
      role: "manager",
      status: "pending",
      userId: null,
    });

    const response = await POST(
      new Request("http://localhost/api/projects/project_123/invitations", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          email: "friend@example.com",
        }),
      }),
      {
        params: Promise.resolve({ projectId: "project_123" }),
      },
    );

    expect(response.status).toBe(201);
    expect(mockInviteMember).toHaveBeenCalledWith(
      "project_123",
      "microsoft:user-123",
      { email: "friend@example.com" },
    );
  });

  it("maps invitation conflicts to 409", async () => {
    mockInviteMember.mockRejectedValue(
      new ProjectServiceError(
        "This email has already been invited to the project.",
        "PROJECT_INVITE_CONFLICT",
      ),
    );

    const response = await POST(
      new Request("http://localhost/api/projects/project_123/invitations", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          email: "friend@example.com",
        }),
      }),
      {
        params: Promise.resolve({ projectId: "project_123" }),
      },
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      error: "This email has already been invited to the project.",
    });
  });
});
