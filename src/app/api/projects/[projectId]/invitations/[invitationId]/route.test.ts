import { DELETE } from "@/app/api/projects/[projectId]/invitations/[invitationId]/route";
import { ProjectServiceError } from "@/lib/services/project-service";

const mockRemoveMember = vi.fn();
const mockGetApiSessionUser = vi.fn();

vi.mock("@/lib/services/project-service", async () => {
  const actual = await vi.importActual<typeof import("@/lib/services/project-service")>(
    "@/lib/services/project-service",
  );

  return {
    ...actual,
    createProjectService: () => ({
      removeMember: mockRemoveMember,
    }),
  };
});

vi.mock("@/lib/auth/api-user", () => ({
  getApiSessionUser: (...args: unknown[]) => mockGetApiSessionUser(...args),
}));

describe("projects/[projectId]/invitations/[invitationId] route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetApiSessionUser.mockResolvedValue({
      id: "microsoft:user-123",
      selectedProjectId: "project_123",
    });
  });

  it("deletes an invitation for the owner", async () => {
    mockRemoveMember.mockResolvedValue(undefined);

    const response = await DELETE(
      new Request("http://localhost/api/projects/project_123/invitations/invite_1", {
        method: "DELETE",
      }),
      {
        params: Promise.resolve({
          projectId: "project_123",
          invitationId: "invite_1",
        }),
      },
    );

    expect(response.status).toBe(204);
    expect(mockRemoveMember).toHaveBeenCalledWith(
      "project_123",
      "microsoft:user-123",
      "invite_1",
    );
  });

  it("maps missing collaborators to 404", async () => {
    mockRemoveMember.mockRejectedValue(
      new ProjectServiceError("Collaborator not found.", "PROJECT_MEMBER_NOT_FOUND"),
    );

    const response = await DELETE(
      new Request("http://localhost/api/projects/project_123/invitations/invite_1", {
        method: "DELETE",
      }),
      {
        params: Promise.resolve({
          projectId: "project_123",
          invitationId: "invite_1",
        }),
      },
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Collaborator not found.",
    });
  });
});
