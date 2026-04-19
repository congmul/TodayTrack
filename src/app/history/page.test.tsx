import HistoryPage from "@/app/history/page";
import { render } from "@testing-library/react";

const mockRequireServerSession = vi.fn();
const mockRedirect = vi.fn();
const mockGetWorkspaceContext = vi.fn();
const mockHistoryView = vi.fn(() => <div>History View</div>);

vi.mock("@/lib/auth/session", () => ({
  requireServerSession: (...args: unknown[]) => mockRequireServerSession(...args),
}));

vi.mock("@/lib/services/workspace-service", () => ({
  createWorkspaceService: () => ({
    getWorkspaceContext: mockGetWorkspaceContext,
  }),
}));

vi.mock("@/components/history-view", () => ({
  HistoryView: (props: unknown) => mockHistoryView(props),
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

describe("HistoryPage", () => {
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

    await HistoryPage({
      searchParams: Promise.resolve({}),
    });

    expect(mockRedirect).toHaveBeenCalledWith("/projects");
  });

  it("renders the history view for users with projects", async () => {
    mockGetWorkspaceContext.mockResolvedValue({
      hasProjects: true,
      projects: [{ id: "project_task_home", name: "Home Tasks" }],
      selectedProject: { id: "project_task_home", name: "Home Tasks" },
      user: { id: "microsoft:user-123" },
    });

    render(
      await HistoryPage({
        searchParams: Promise.resolve({ project: "project_task_home" }),
      }),
    );

    expect(mockHistoryView).toHaveBeenCalledWith(
      expect.objectContaining({
        projects: [{ id: "project_task_home", name: "Home Tasks" }],
        project: { id: "project_task_home", name: "Home Tasks" },
      }),
    );
  });
});
