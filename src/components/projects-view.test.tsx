import { render, screen } from "@testing-library/react";
import { ProjectsView } from "@/components/projects-view";

describe("ProjectsView", () => {
  it("renders the dedicated projects route", () => {
    render(<ProjectsView projectId="project_task_home" />);

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
    expect(
      screen.getAllByRole("link", { name: "Open project detail" })[0],
    ).toHaveAttribute(
      "href",
      "/projects/project_habit_english?project=project_habit_english",
    );
    expect(
      screen.getByRole("heading", { name: "Work Ops", level: 2 }),
    ).toBeInTheDocument();
  });
});
