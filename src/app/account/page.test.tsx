import { render, screen } from "@testing-library/react";
import AccountPage from "@/app/account/page";

const mockRequireServerSession = vi.fn();
const mockGetWorkspaceContext = vi.fn();

vi.mock("@/lib/auth/session", () => ({
  requireServerSession: (...args: unknown[]) => mockRequireServerSession(...args),
  clearServerSession: vi.fn(),
}));

vi.mock("@/lib/services/workspace-service", () => ({
  createWorkspaceService: () => ({
    getWorkspaceContext: mockGetWorkspaceContext,
  }),
}));

describe("AccountPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetWorkspaceContext.mockResolvedValue({
      hasProjects: true,
      projects: [{ id: "project_task_home", name: "Home Tasks" }],
      selectedProject: { id: "project_task_home", name: "Home Tasks" },
      user: {
        id: "microsoft:microsoft-user-123",
      },
    });
  });

  it("renders account details and the logout button", async () => {
    mockRequireServerSession.mockResolvedValue({
      user: {
        id: "microsoft:microsoft-user-123",
        provider: "microsoft",
        providerUserId: "microsoft-user-123",
        email: "hyun@example.com",
        displayName: "J. Hyun",
        avatarUrl: null,
        selectedProjectId: "project_task_home",
        lastLoginAt: "2026-04-18T19:00:00.000Z",
        createdAt: "2026-04-18T19:00:00.000Z",
        updatedAt: "2026-04-18T19:00:00.000Z",
      },
    });

    render(await AccountPage());

    expect(
      screen.getByRole("heading", { name: "Account and session" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Logout" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Account" })).toHaveAttribute(
      "href",
      "/account?project=project_task_home",
    );
  });
});
