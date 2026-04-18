import { render, screen } from "@testing-library/react";
import { HistoryView } from "@/components/history-view";

describe("HistoryView", () => {
  it("renders the dedicated history route", () => {
    render(<HistoryView accountId="account_demo" projectId="project_task_home" />);

    expect(
      screen.getByRole("heading", { name: "Completion history" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to today" })).toHaveAttribute(
      "href",
      "/today?account=account_demo&project=project_task_home",
    );
    expect(screen.getByRole("link", { name: "History" })).toHaveAttribute(
      "href",
      "/history?account=account_demo&project=project_task_home",
    );
    expect(screen.getByRole("link", { name: "Account" })).toHaveAttribute(
      "href",
      "/account?account=account_demo&project=project_task_home",
    );
    expect(screen.getByText("Overdue tasks")).toBeInTheDocument();
  });
});
