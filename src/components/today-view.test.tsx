import { render, screen } from "@testing-library/react";
import { TodayView } from "@/components/today-view";

describe("TodayView", () => {
  it("renders the today route content and primary navigation links", () => {
    render(<TodayView projectId="project_task_home" />);

    expect(
      screen.getByRole("heading", { name: "Today's tasks" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute(
      "href",
      "/projects?project=project_task_home",
    );
    expect(screen.getByRole("link", { name: "History" })).toHaveAttribute(
      "href",
      "/history?project=project_task_home",
    );
    expect(screen.getByRole("link", { name: "Account" })).toHaveAttribute(
      "href",
      "/account?project=project_task_home",
    );
    expect(screen.getByText("Buy milk on the way home")).toBeInTheDocument();
    expect(screen.queryByText("Read one English paragraph")).not.toBeInTheDocument();
  });
});
