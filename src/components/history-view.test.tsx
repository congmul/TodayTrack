import { render, screen } from "@testing-library/react";
import { HistoryView } from "@/components/history-view";

describe("HistoryView", () => {
  it("renders the dedicated history route", () => {
    render(<HistoryView projectId="project_task_home" />);

    expect(
      screen.getByRole("heading", { name: "Completion history" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to today" })).toHaveAttribute(
      "href",
      "/today?project=project_task_home",
    );
    expect(screen.getByRole("link", { name: "History" })).toHaveAttribute(
      "href",
      "/history?project=project_task_home",
    );
    expect(screen.getByRole("link", { name: "Account" })).toHaveAttribute(
      "href",
      "/account?project=project_task_home",
    );
    expect(screen.getByText("Overdue tasks")).toBeInTheDocument();
  });
});
