import { render, screen } from "@testing-library/react";
import { HistoryView } from "@/components/history-view";

describe("HistoryView", () => {
  it("renders the history placeholder with real project context", () => {
    render(
      <HistoryView
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
      screen.getByRole("heading", { name: "History will follow real task activity" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to projects" })).toHaveAttribute(
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
    expect(screen.getByText("No completion history yet")).toBeInTheDocument();
  });
});
