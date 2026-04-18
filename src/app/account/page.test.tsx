import { render, screen } from "@testing-library/react";
import AccountPage from "@/app/account/page";

const mockRequireServerSession = vi.fn();

vi.mock("@/lib/auth/session", () => ({
  requireServerSession: (...args: unknown[]) => mockRequireServerSession(...args),
  clearServerSession: vi.fn(),
}));

describe("AccountPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders account details and the logout button", async () => {
    mockRequireServerSession.mockResolvedValue({
      user: {
        id: "azure:azure-user-123",
        provider: "azure",
        providerUserId: "azure-user-123",
        email: "hyun@example.com",
        displayName: "J. Hyun",
        avatarUrl: null,
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
      "/account?account=account_demo&project=project_task_home",
    );
  });
});
