import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProjectsView } from "@/components/projects-view";

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

describe("ProjectsView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders owned and shared projects with selection state", () => {
    render(
      <ProjectsView
        projects={[
          {
            id: "project_habit_english",
            ownerUserId: "microsoft:user-123",
            name: "English Habit",
            description: "Practice reading every day.",
            type: "habit",
            status: "active",
            alertEnabled: false,
            taskCount: 3,
            accessRole: "owner",
            isSelected: false,
            createdAt: "2026-04-18T08:00:00.000Z",
            updatedAt: "2026-04-18T08:00:00.000Z",
          },
          {
            id: "project_task_home",
            ownerUserId: "google:owner-456",
            name: "Home Tasks",
            description: "Practical chores and errands.",
            type: "task",
            status: "active",
            alertEnabled: false,
            taskCount: 5,
            accessRole: "manager",
            isSelected: true,
            createdAt: "2026-04-18T08:00:00.000Z",
            updatedAt: "2026-04-18T08:00:00.000Z",
          },
        ]}
        selectedProjectId="project_task_home"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Project workspace" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("banner")).toHaveTextContent("Home Tasks");
    expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute(
      "href",
      "/projects?project=project_task_home",
    );
    expect(screen.getByRole("link", { name: "Create project" })).toHaveAttribute(
      "href",
      "/projects/new?project=project_task_home",
    );
    expect(screen.getAllByText("Selected")).toHaveLength(2);
    expect(screen.getByText("Tasks: 5")).toBeInTheDocument();
    expect(screen.getByText("manager")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Back to today" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Open project detail" }),
    ).not.toBeInTheDocument();
  });

  it("selects a project without navigating", async () => {
    const user = userEvent.setup();
    mockAuthorizedFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        user: {
          selectedProjectId: "project_habit_english",
        },
      }),
    });

    render(
      <ProjectsView
        projects={[
          {
            id: "project_task_home",
            ownerUserId: "google:owner-456",
            name: "Home Tasks",
            description: "Practical chores and errands.",
            type: "task",
            status: "active",
            alertEnabled: false,
            taskCount: 5,
            accessRole: "manager",
            isSelected: true,
            createdAt: "2026-04-18T08:00:00.000Z",
            updatedAt: "2026-04-18T08:00:00.000Z",
          },
          {
            id: "project_habit_english",
            ownerUserId: "microsoft:user-123",
            name: "English Habit",
            description: "Practice reading every day.",
            type: "habit",
            status: "active",
            alertEnabled: false,
            taskCount: 3,
            accessRole: "owner",
            isSelected: false,
            createdAt: "2026-04-18T08:00:00.000Z",
            updatedAt: "2026-04-18T08:00:00.000Z",
          },
        ]}
        selectedProjectId="project_task_home"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Select project" }));

    expect(mockAuthorizedFetch).toHaveBeenCalledWith(
      "/api/auth/session",
      expect.objectContaining({
        method: "PATCH",
      }),
    );
    expect(mockRefresh).toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("navigates to detail when the card is clicked", async () => {
    const user = userEvent.setup();

    render(
      <ProjectsView
        projects={[
          {
            id: "project_habit_english",
            ownerUserId: "microsoft:user-123",
            name: "English Habit",
            description: "Practice reading every day.",
            type: "habit",
            status: "active",
            alertEnabled: false,
            taskCount: 3,
            accessRole: "owner",
            isSelected: false,
            createdAt: "2026-04-18T08:00:00.000Z",
            updatedAt: "2026-04-18T08:00:00.000Z",
          },
        ]}
      />,
    );

    await user.click(screen.getByRole("link", { name: "English Habit" }));

    expect(mockPush).toHaveBeenCalledWith(
      "/projects/project_habit_english?project=project_habit_english",
    );
  });

  it("renders one onboarding card when the user has no projects", () => {
    render(<ProjectsView projects={[]} />);

    expect(
      screen.getByRole("heading", { name: "Create your first project" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("banner")).toHaveTextContent("No project selected");
    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(screen.queryByRole("link", { name: "Today" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Projects" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Account" })).toBeInTheDocument();
  });
});
