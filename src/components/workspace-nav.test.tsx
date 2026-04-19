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
}));

describe("WorkspaceNav", () => {
  beforeEach(() => {
    push.mockReset();
    mockAuthorizedFetch.mockReset();
  });

  it("shows the project selector", () => {
    render(
      <WorkspaceNav
        projects={[
          { id: "project_habit_english", name: "English Habit" },
          { id: "project_task_home", name: "Home Tasks" },
        ]}
        selectedProjectId="project_task_home"
      />,
    );

    expect(screen.getByLabelText("Project")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Home Tasks")).toBeInTheDocument();
  });
});
