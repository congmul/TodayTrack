import { render, screen } from "@testing-library/react";
import { WorkspaceNav } from "@/components/workspace-nav";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/today",
  useSearchParams: () =>
    new URLSearchParams("account=account_demo&project=project_task_home"),
}));

describe("WorkspaceNav", () => {
  beforeEach(() => {
    push.mockReset();
  });

  it("shows account and project selectors", () => {
    render(<WorkspaceNav />);

    expect(screen.getByLabelText("Account")).toBeInTheDocument();
    expect(screen.getByLabelText("Project")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Demo Account (J. Hyun)")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Home Tasks")).toBeInTheDocument();
  });
});
