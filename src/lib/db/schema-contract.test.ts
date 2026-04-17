import { readFileSync } from "node:fs";
import path from "node:path";

const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");

function readSchema() {
  return readFileSync(schemaPath, "utf8");
}

describe("Prisma schema contract", () => {
  it("stores project type instead of separate task models", () => {
    const schema = readSchema();

    expect(schema).toContain("enum ProjectType");
    expect(schema).toContain("HABIT");
    expect(schema).toContain("TASK");
    expect(schema).toContain("type          ProjectType");
    expect(schema).toContain("model Task {");
  });

  it("keeps repeat behavior optional on the task model", () => {
    const schema = readSchema();

    expect(schema).toContain("repeatRule       Json?");
    expect(schema).not.toContain("model HabitTask");
    expect(schema).not.toContain("model RecurringTask");
  });

  it("captures per-day occurrence history for completed and missed repeats", () => {
    const schema = readSchema();

    expect(schema).toContain("model TaskOccurrence");
    expect(schema).toContain("scheduledDate  DateTime             @db.Date");
    expect(schema).toContain("status         TaskOccurrenceStatus @default(PENDING)");
    expect(schema).toContain("@@unique([taskId, scheduledDate])");
  });

  it("stores timezone-aware scheduling inputs on users and occurrences", () => {
    const schema = readSchema();

    expect(schema).toContain('timezone      String        @default("America/Los_Angeles")');
    expect(schema).toContain("sourceTimezone String");
  });
});
