import { render, screen } from "@testing-library/react";
import { AppHeader } from "@/components/app-header";

describe("AppHeader", () => {
  it("shows the TodayTrack brand with the selected project", () => {
    render(<AppHeader selectedProjectName="Home Tasks" />);

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /TodayTrack/i })).toHaveAttribute(
      "href",
      "/projects",
    );
    expect(screen.getByText("Home Tasks")).toBeInTheDocument();
  });

  it("shows a fallback label when no project is selected", () => {
    render(<AppHeader selectedProjectName={null} />);

    expect(screen.getByText("No project selected")).toBeInTheDocument();
  });
});
