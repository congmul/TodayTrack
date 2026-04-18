import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProjectCreateForm } from "@/components/project-create-form";

describe("ProjectCreateForm", () => {
  it("requires a project type selection before submit is enabled", async () => {
    const user = userEvent.setup();

    render(<ProjectCreateForm />);

    const submitButton = screen.getByRole("button", {
      name: "Create project",
    });
    expect(submitButton).toBeDisabled();

    await user.type(screen.getByLabelText("Project name"), "Morning Routine");
    expect(submitButton).toBeDisabled();

    await user.selectOptions(screen.getByLabelText("Project type"), "habit");
    expect(submitButton).toBeEnabled();
  });

  it("shows both allowed project type options", () => {
    render(<ProjectCreateForm />);

    expect(screen.getByRole("option", { name: "Habit" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Task" })).toBeInTheDocument();
  });
});
