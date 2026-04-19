import { render, screen } from "@testing-library/react";
import { ProjectDetailView } from "@/components/project-detail-view";

describe("ProjectDetailView", () => {
  it("renders an existing project detail page", () => {
    render(
      <ProjectDetailView
        project={{
          id: "project_task_home",
          userId: "microsoft:user-123",
          name: "Home Tasks",
          description: "Practical chores and errands.",
          type: "task",
          status: "active",
          alertEnabled: false,
          createdAt: "2026-04-18T08:00:00.000Z",
          updatedAt: "2026-04-18T08:00:00.000Z",
        }}
        projects={[
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
      screen.getByRole("heading", { name: "Home Tasks" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Type: task")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to projects" })).toHaveAttribute(
      "href",
      "/projects?project=project_task_home",
    );
  });

  it("renders a not-found state for unknown ids", () => {
    render(<ProjectDetailView project={null} projects={[]} />);

    expect(
      screen.getByRole("heading", { name: "Project not found" }),
    ).toBeInTheDocument();
  });
});
