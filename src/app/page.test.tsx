import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

describe("Home", () => {
  it("renders the route-first landing copy", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        name: "Keep today's work clear, calm, and moving.",
      }),
    ).toBeInTheDocument();
  });

  it("links to the dedicated feature routes", () => {
    render(<Home />);

    expect(screen.getByRole("link", { name: /daily task view/i })).toHaveAttribute(
      "href",
      "/today",
    );
    expect(
      screen.getByRole("link", { name: /project list and summaries/i }),
    ).toHaveAttribute("href", "/projects");
    expect(
      screen.getByRole("link", { name: /completion analytics preview/i }),
    ).toHaveAttribute("href", "/history");
  });
});
