import { render, screen } from "@testing-library/react";
import { HistoryView } from "@/components/history-view";

describe("HistoryView", () => {
  it("renders the dedicated history route", () => {
    render(<HistoryView />);

    expect(
      screen.getByRole("heading", { name: "Completion history" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to today" })).toHaveAttribute(
      "href",
      "/today",
    );
    expect(screen.getByRole("link", { name: "History" })).toHaveAttribute(
      "href",
      "/history",
    );
  });
});
