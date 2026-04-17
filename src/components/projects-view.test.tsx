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
  });
});
