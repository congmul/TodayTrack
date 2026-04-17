import { getDashboardPreview } from "@/lib/dashboard-preview";

describe("getDashboardPreview", () => {
  it("returns a mobile-first dashboard preview with summary, tasks, and history", () => {
    const preview = getDashboardPreview();

    expect(preview.projectName).toBeTruthy();
    expect(preview.summary).toHaveLength(4);
    expect(preview.tasks.length).toBeGreaterThan(0);
    expect(preview.history.length).toBeGreaterThan(0);
  });

  it("includes at least one completed task so strike-through states can be exercised", () => {
    const preview = getDashboardPreview();

    expect(preview.tasks.some((task) => task.done)).toBe(true);
  });

  it("includes overdue or due-today labels that match the product definition", () => {
    const preview = getDashboardPreview();
    const dueLabels = preview.tasks.map((task) => task.dueLabel);

    expect(dueLabels).toEqual(
      expect.arrayContaining(["Due today", "Overdue"]),
    );
  });
});
