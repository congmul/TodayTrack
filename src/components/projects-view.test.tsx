import { render, screen } from "@testing-library/react";
import { ProjectsView } from "@/components/projects-view";

describe("ProjectsView", () => {
  it("renders the owned project list", () => {
    render(
      <ProjectsView
        projects={[
          {
            id: "project_habit_english",
            userId: "microsoft:user-123",
            name: "English Habit",
            description: "Practice reading every day.",
            type: "habit",
            status: "active",
            alertEnabled: false,
            createdAt: "2026-04-18T08:00:00.000Z",
            updatedAt: "2026-04-18T08:00:00.000Z",
          },
          {
            id: "project_task_home",
            userId: "microsoft:user-123",
            name: "Home Tasks",
            description: "Practical chores and errands.",
            type: "task",
            status: "active",
            alertEnabled: false,
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
    expect(screen.getByRole("link", { name: "Back to today" })).toHaveAttribute(
      "href",
      "/today?project=project_task_home",
    );
    expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute(
      "href",
      "/projects?project=project_task_home",
    );
    expect(screen.getByRole("link", { name: "Create project" })).toHaveAttribute(
      "href",
      "/projects/new?project=project_task_home",
    );
    expect(screen.getAllByRole("link", { name: "Open project detail" })[0]).toHaveAttribute(
      "href",
      "/projects/project_habit_english?project=project_habit_english",
    );
    expect(screen.queryByText("Work Ops")).not.toBeInTheDocument();
  });

  it("renders one onboarding card when the user has no projects", () => {
    render(<ProjectsView projects={[]} />);

    expect(
      screen.getByRole("heading", { name: "Create your first project" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(screen.queryByLabelText("Project")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Today" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Projects" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Account" })).toBeInTheDocument();
  });
});
