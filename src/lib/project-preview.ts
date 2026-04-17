export type ProjectPreview = {
  id: string;
  name: string;
  description: string;
  type: "habit" | "task";
  status: "active" | "planning";
  detail: string;
  summary: string[];
};

const projectPreviews: ProjectPreview[] = [
  {
    id: "project_habit_english",
    name: "English Habit",
    description: "Practice reading every day.",
    type: "habit",
    status: "active",
    detail:
      "A habit-focused project for building consistency with short daily reading sessions.",
    summary: ["Completion rate focus", "No overdue warnings", "Streak tracking"],
  },
  {
    id: "project_task_home",
    name: "Home Tasks",
    description: "Practical chores and errands.",
    type: "task",
    status: "active",
    detail:
      "A deadline-oriented project for home chores, errands, and practical work that can become overdue.",
    summary: ["Due dates matter", "Overdue highlighting", "Alert-ready"],
  },
  {
    id: "project_task_work",
    name: "Work Ops",
    description: "Operational follow-ups and deadlines.",
    type: "task",
    status: "planning",
    detail:
      "A task project for operational follow-ups and work deadlines that benefit from clear urgency signals.",
    summary: ["Operational visibility", "Due soon emphasis", "Actionable alerts"],
  },
];

export function listProjectPreviews() {
  return projectPreviews;
}

export function getProjectPreview(projectId: string) {
  return projectPreviews.find((project) => project.id === projectId) ?? null;
}
