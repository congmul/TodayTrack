import { render, screen } from "@testing-library/react";
import { TodayView } from "@/components/today-view";

describe("TodayView", () => {
  it("renders the today route content and primary navigation links", () => {
    render(<TodayView />);

    expect(
      screen.getByRole("heading", { name: "Today's tasks" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute(
      "href",
      "/projects",
    );
    expect(screen.getByRole("link", { name: "History" })).toHaveAttribute(
      "href",
      "/history",
    );
  });
});
