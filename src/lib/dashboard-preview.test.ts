import { getDashboardPreview } from "@/lib/workspace-preview";

describe("getDashboardPreview", () => {
  it("returns a mobile-first dashboard preview with summary, tasks, and history", () => {
    const preview = getDashboardPreview();

    expect(preview.project.name).toBeTruthy();
    expect(preview.summary).toHaveLength(4);
    expect(preview.tasks.length).toBeGreaterThan(0);
    expect(preview.history.length).toBeGreaterThan(0);
  });

  it("includes at least one completed task so strike-through states can be exercised", () => {
    const preview = getDashboardPreview();

    expect(preview.tasks.some((task) => task.done)).toBe(true);
  });

  it("includes overdue or due-today labels that match the product definition", () => {
    const preview = getDashboardPreview("project_task_home");
    const dueLabels = preview.tasks.map((task) => task.dueLabel);

    expect(dueLabels).toEqual(
      expect.arrayContaining(["Due today", "Overdue"]),
    );
  });

  it("filters tasks by the selected project while keeping the project list available", () => {
    const preview = getDashboardPreview("project_task_work");

    expect(preview.projects).toHaveLength(3);
    expect(preview.project.id).toBe("project_task_work");
    expect(preview.tasks.every((task) => task.projectId === "project_task_work")).toBe(
      true,
    );
  });
});
