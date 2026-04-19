import { render, screen } from "@testing-library/react";
import { ProjectDetailView } from "@/components/project-detail-view";

describe("ProjectDetailView", () => {
  it("renders an existing project detail page", () => {
    render(<ProjectDetailView projectId="project_task_home" />);

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
    render(<ProjectDetailView projectId="missing_project" />);

    expect(
      screen.getByRole("heading", { name: "Project not found" }),
    ).toBeInTheDocument();
  });
});
