import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProjectDangerZone } from "@/components/project-danger-zone";

const mockAuthorizedFetch = vi.fn();
const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock("@/lib/auth/client-auth", () => ({
  authorizedFetch: (...args: unknown[]) => mockAuthorizedFetch(...args),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

describe("ProjectDangerZone", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires the exact project name before deleting", async () => {
    const user = userEvent.setup();
    mockAuthorizedFetch.mockResolvedValue({
      ok: true,
    });

    render(
      <ProjectDangerZone
        projectId="project_123"
        projectName="Home Tasks"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Delete project" }));
    expect(screen.getByText(/Are you sure\?/)).toBeInTheDocument();

    const confirmButton = screen.getByRole("button", {
      name: "Delete permanently",
    });
    expect(confirmButton).toBeDisabled();

    await user.type(screen.getByPlaceholderText("Home Tasks"), "Home Tasks");
    expect(confirmButton).toBeEnabled();

    await user.click(confirmButton);

    expect(mockAuthorizedFetch).toHaveBeenCalledWith("/api/projects/project_123", {
      method: "DELETE",
    });
    expect(mockPush).toHaveBeenCalledWith("/projects");
    expect(mockRefresh).toHaveBeenCalled();
  });
});
