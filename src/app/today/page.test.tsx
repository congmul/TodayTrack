import TodayPage from "@/app/today/page";
import { render } from "@testing-library/react";

const mockRequireServerSession = vi.fn();
const mockRedirect = vi.fn();
const mockGetWorkspaceContext = vi.fn();
const mockTodayView = vi.fn(() => <div>Today View</div>);
const mockListProjects = vi.fn();

vi.mock("@/lib/auth/session", () => ({
  requireServerSession: (...args: unknown[]) => mockRequireServerSession(...args),
}));

vi.mock("@/lib/services/workspace-service", () => ({
  createWorkspaceService: () => ({
    getWorkspaceContext: mockGetWorkspaceContext,
  }),
}));

vi.mock("@/lib/services/project-service", () => ({
  createProjectService: () => ({
    listProjects: mockListProjects,
  }),
}));

vi.mock("@/components/today-view", () => ({
  TodayView: (props: unknown) => mockTodayView(props),
}));

vi.mock("next/navigation", async () => {
  const actual = await vi.importActual<typeof import("next/navigation")>(
    "next/navigation",
  );

  return {
    ...actual,
    redirect: (...args: unknown[]) => mockRedirect(...args),
  };
});

describe("TodayPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireServerSession.mockResolvedValue({
      user: { id: "microsoft:user-123", selectedProjectId: null },
    });
  });

  it("redirects users without projects back to projects", async () => {
    mockGetWorkspaceContext.mockResolvedValue({
      hasProjects: false,
      projects: [],
      selectedProject: null,
      user: { id: "microsoft:user-123" },
    });

    await TodayPage({
      searchParams: Promise.resolve({}),
    });

    expect(mockRedirect).toHaveBeenCalledWith("/projects");
  });

  it("renders the today view for users with projects", async () => {
    mockGetWorkspaceContext.mockResolvedValue({
      hasProjects: true,
      projects: [{ id: "project_task_home", name: "Home Tasks" }],
      selectedProject: { id: "project_task_home", name: "Home Tasks" },
      user: { id: "microsoft:user-123" },
    });
    mockListProjects.mockResolvedValue([
      {
        id: "project_task_home",
        name: "Home Tasks",
        ownerUserId: "microsoft:user-123",
      },
    ]);

    render(
      await TodayPage({
        searchParams: Promise.resolve({ project: "project_task_home" }),
      }),
    );

    expect(mockTodayView).toHaveBeenCalledWith({
      project: {
        id: "project_task_home",
        name: "Home Tasks",
        ownerUserId: "microsoft:user-123",
      },
    });
  });
});
