import { render, screen } from "@testing-library/react";
import { TodayView } from "@/components/today-view";

describe("TodayView", () => {
  it("renders the today placeholder with real project context", () => {
    render(
      <TodayView
        project={{
          id: "project_task_home",
          ownerUserId: "microsoft:user-123",
          name: "Home Tasks",
          description: "Practical chores and errands.",
          type: "task",
          status: "active",
          alertEnabled: false,
          taskCount: 0,
          accessRole: "owner",
          isSelected: true,
          createdAt: "2026-04-18T08:00:00.000Z",
          updatedAt: "2026-04-18T08:00:00.000Z",
        }}
      />,
    );

    expect(screen.getByRole("banner")).toHaveTextContent("Home Tasks");
    expect(
      screen.getByRole("heading", { name: "Home Tasks is ready for task planning." }),
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
    expect(screen.getByRole("heading", { name: "Tasks will appear here" })).toBeInTheDocument();
    expect(screen.queryByText("Buy milk on the way home")).not.toBeInTheDocument();
  });
});
