import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

describe("Home", () => {
  it("renders the MVP positioning copy", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        name: "Keep today's work clear, calm, and moving.",
      }),
    ).toBeInTheDocument();
  });

  it("renders the primary today section and task cards", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: "Today's tasks" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Spring Launch")).toBeInTheDocument();
    expect(
      screen.getByText("Confirm final banner copy with the product team"),
    ).toBeInTheDocument();
  });

  it("renders primary navigation labels for the mobile-first shell", () => {
    render(<Home />);

    expect(screen.getByRole("navigation", { name: "Primary" })).toBeInTheDocument();
    expect(screen.getByText("Today")).toBeInTheDocument();
    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.getByText("History")).toBeInTheDocument();
  });
});
