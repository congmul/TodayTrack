import { render, screen } from "@testing-library/react";
import { ProjectsView } from "@/components/projects-view";

describe("ProjectsView", () => {
  it("renders the dedicated projects route", () => {
    render(<ProjectsView />);

    expect(
      screen.getByRole("heading", { name: "Project workspace" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to today" })).toHaveAttribute(
      "href",
      "/today",
    );
    expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute(
      "href",
      "/projects",
    );
    expect(
      screen.getAllByRole("link", { name: "Open project detail" })[0],
    ).toHaveAttribute("href", "/projects/project_habit_english");
  });
});
