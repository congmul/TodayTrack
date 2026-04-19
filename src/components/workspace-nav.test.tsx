import { render, screen } from "@testing-library/react";
import { WorkspaceNav } from "@/components/workspace-nav";

const push = vi.fn();
const mockAuthorizedFetch = vi.fn();

vi.mock("@/lib/auth/client-auth", () => ({
  authorizedFetch: (...args: unknown[]) => mockAuthorizedFetch(...args),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/today",
  useSearchParams: () =>
    new URLSearchParams("project=project_task_home"),
}));

describe("WorkspaceNav", () => {
  beforeEach(() => {
    push.mockReset();
    mockAuthorizedFetch.mockReset();
  });

  it("shows the project selector", () => {
    render(<WorkspaceNav />);

    expect(screen.getByLabelText("Project")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Home Tasks")).toBeInTheDocument();
  });
});
