import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProjectCreateForm } from "@/components/project-create-form";

const mockAuthorizedFetch = vi.fn();

vi.mock("@/lib/auth/client-auth", () => ({
  authorizedFetch: (...args: unknown[]) => mockAuthorizedFetch(...args),
}));

describe("ProjectCreateForm", () => {
  const projects = [
    { id: "project_task_home", name: "Home Tasks" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires a project type selection before submit is enabled", async () => {
    const user = userEvent.setup();

    render(<ProjectCreateForm projects={projects} selectedProjectId="project_task_home" />);

    expect(screen.getByRole("banner")).toHaveTextContent("Home Tasks");
    const submitButton = screen.getByRole("button", {
      name: "Create project",
    });
    expect(submitButton).toBeDisabled();

    await user.type(screen.getByLabelText("Project name"), "Morning Routine");
    expect(submitButton).toBeDisabled();

    await user.selectOptions(screen.getByLabelText("Project type"), "habit");
    expect(submitButton).toBeEnabled();
  });

  it("shows both allowed project type options", () => {
    render(<ProjectCreateForm projects={projects} selectedProjectId="project_task_home" />);

    expect(screen.getByRole("option", { name: "Habit" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Task" })).toBeInTheDocument();
  });

  it("passes authorized headers through the shared frontend auth helper", async () => {
    const user = userEvent.setup();

    mockAuthorizedFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        project: {
          id: "project_123",
          name: "Morning Routine",
          type: "habit",
        },
      }),
    });

    render(<ProjectCreateForm projects={projects} selectedProjectId="project_task_home" />);

    await user.type(screen.getByLabelText("Project name"), "Morning Routine");
    await user.selectOptions(screen.getByLabelText("Project type"), "habit");
    await user.click(screen.getByRole("button", { name: "Create project" }));

    expect(mockAuthorizedFetch).toHaveBeenCalledWith(
      "/api/projects",
      expect.objectContaining({
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
      }),
    );
  });
});
