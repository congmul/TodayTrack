import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProjectInvitePanel } from "@/components/project-invite-panel";

const mockAuthorizedFetch = vi.fn();

vi.mock("@/lib/auth/client-auth", () => ({
  authorizedFetch: (...args: unknown[]) => mockAuthorizedFetch(...args),
}));

describe("ProjectInvitePanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders invitation rows", () => {
    render(
      <ProjectInvitePanel
        invitations={[
          {
            id: "invite_1",
            invitedEmail: "friend@example.com",
            role: "manager",
            status: "pending",
            userId: null,
            createdAt: "2026-04-18T08:00:00.000Z",
            updatedAt: "2026-04-18T08:00:00.000Z",
          },
        ]}
        projectId="project_123"
      />,
    );

    expect(screen.getByText("friend@example.com")).toBeInTheDocument();
    expect(screen.getByText("Pending until this email signs in")).toBeInTheDocument();
  });

  it("submits a new invite", async () => {
    const user = userEvent.setup();
    mockAuthorizedFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        invitation: {
          id: "invite_1",
          invitedEmail: "friend@example.com",
          role: "manager",
          status: "pending",
          userId: null,
          createdAt: "2026-04-18T08:00:00.000Z",
          updatedAt: "2026-04-18T08:00:00.000Z",
        },
      }),
    });

    render(<ProjectInvitePanel invitations={[]} projectId="project_123" />);

    await user.type(screen.getByLabelText("Email"), "friend@example.com");
    await user.click(screen.getByRole("button", { name: "Invite user" }));

    expect(mockAuthorizedFetch).toHaveBeenCalledWith(
      "/api/projects/project_123/invitations",
      expect.objectContaining({
        method: "POST",
      }),
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Invitation sent to friend@example.com.",
    );
  });

  it("lets the owner delete an invitation", async () => {
    const user = userEvent.setup();
    mockAuthorizedFetch.mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    render(
      <ProjectInvitePanel
        canDeleteInvitations
        invitations={[
          {
            id: "invite_1",
            invitedEmail: "friend@example.com",
            role: "manager",
            status: "pending",
            userId: null,
            createdAt: "2026-04-18T08:00:00.000Z",
            updatedAt: "2026-04-18T08:00:00.000Z",
          },
        ]}
        projectId="project_123"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(mockAuthorizedFetch).toHaveBeenCalledWith(
      "/api/projects/project_123/invitations/invite_1",
      expect.objectContaining({
        method: "DELETE",
      }),
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Collaborator removed from the project.",
    );
    expect(screen.queryByText("friend@example.com")).not.toBeInTheDocument();
  });
});
