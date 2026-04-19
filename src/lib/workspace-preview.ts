export type ProjectPreview = {
  id: string;
  name: string;
  description: string;
  type: "habit" | "task";
  status: "active" | "planning";
  detail: string;
  summary: string[];
};

export type PreviewTask = {
  id: string;
  projectId: string;
  title: string;
  note: string;
  assignee: string;
  dueLabel: string;
  priority: "High" | "Medium" | "Low";
  tag: string;
  done: boolean;
};

export type SummaryCard = {
  label: string;
  value: string;
  detail: string;
};

export type HistoryPreview = {
  label: string;
  value: string;
  detail: string;
};

export type DashboardPreview = {
  project: ProjectPreview;
  projects: ProjectPreview[];
  summary: SummaryCard[];
  tasks: PreviewTask[];
  history: HistoryPreview[];
};

const projects: ProjectPreview[] = [
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

const tasks: PreviewTask[] = [
  {
    id: "task-1",
    projectId: "project_habit_english",
    title: "Read one English paragraph",
    note: "Keep the habit light enough to sustain every day.",
    assignee: "J. Hyun",
    dueLabel: "Expected today",
    priority: "Medium",
    tag: "Habit",
    done: false,
  },
  {
    id: "task-2",
    projectId: "project_habit_english",
    title: "Write two new vocabulary notes",
    note: "Supports the streak and completion-rate view for the habit project.",
    assignee: "J. Hyun",
    dueLabel: "Expected today",
    priority: "Low",
    tag: "Vocabulary",
    done: true,
  },
  {
    id: "task-3",
    projectId: "project_task_home",
    title: "Buy milk on the way home",
    note: "One-time task project item with a practical due date.",
    assignee: "J. Hyun",
    dueLabel: "Due today",
    priority: "High",
    tag: "Errand",
    done: false,
  },
  {
    id: "task-4",
    projectId: "project_task_home",
    title: "Take out recycling",
    note: "Overdue tasks stay visible so real-life chores do not disappear.",
    assignee: "J. Hyun",
    dueLabel: "Overdue",
    priority: "Medium",
    tag: "Home",
    done: false,
  },
  {
    id: "task-5",
    projectId: "project_task_work",
    title: "Prepare weekly ops summary",
    note: "Task-project work should show urgency and deadlines clearly.",
    assignee: "J. Hyun",
    dueLabel: "Due today",
    priority: "High",
    tag: "Ops",
    done: false,
  },
  {
    id: "task-6",
    projectId: "project_task_work",
    title: "Confirm vendor follow-up status",
    note: "Useful example for deadline-oriented operational work.",
    assignee: "J. Hyun",
    dueLabel: "Due tomorrow",
    priority: "Medium",
    tag: "Vendor",
    done: true,
  },
];

const historyByProject: Record<string, HistoryPreview[]> = {
  project_habit_english: [
    {
      label: "Weekly completion rate",
      value: "92%",
      detail: "Habit projects highlight expected vs completed work.",
    },
    {
      label: "Current streak",
      value: "11 days",
      detail: "Streaks restart when an expected day is missed.",
    },
    {
      label: "Missed rate",
      value: "8%",
      detail: "Missed tasks are tracked without overdue pressure.",
    },
  ],
  project_task_home: [
    {
      label: "Open tasks",
      value: "02",
      detail: "Task projects emphasize operational visibility.",
    },
    {
      label: "Overdue tasks",
      value: "01",
      detail: "Overdue items stay visible until completed.",
    },
    {
      label: "Completed this week",
      value: "05",
      detail: "Useful for practical household progress tracking.",
    },
  ],
  project_task_work: [
    {
      label: "Due soon",
      value: "03",
      detail: "Work ops projects emphasize deadlines and alerts.",
    },
    {
      label: "Open tasks",
      value: "04",
      detail: "Keeps operational work visible in one route.",
    },
    {
      label: "Completed this week",
      value: "07",
      detail: "Operational history should stay easy to scan.",
    },
  ],
};

const summaryByProject: Record<string, SummaryCard[]> = {
  project_habit_english: [
    {
      label: "Expected Today",
      value: "02",
      detail: "Habit tasks due today for this selected project.",
    },
    {
      label: "Completed Today",
      value: "01",
      detail: "Completion contributes to rate and streak.",
    },
    {
      label: "Current Streak",
      value: "11",
      detail: "Resets if an expected day is missed.",
    },
    {
      label: "Weekly Rate",
      value: "92%",
      detail: "Habit analytics are scoped to the selected project.",
    },
  ],
  project_task_home: [
    {
      label: "Due Today",
      value: "01",
      detail: "Task items due today for the selected project.",
    },
    {
      label: "Overdue",
      value: "01",
      detail: "Overdue work remains visible in the Today view.",
    },
    {
      label: "Completed Today",
      value: "00",
      detail: "Practical tasks can still be completed after overdue.",
    },
    {
      label: "Weekly Rate",
      value: "67%",
      detail: "A simple status snapshot for this project.",
    },
  ],
  project_task_work: [
    {
      label: "Due Today",
      value: "01",
      detail: "Operational work due on the selected project.",
    },
    {
      label: "Due Tomorrow",
      value: "01",
      detail: "Helps surface the next deadline early.",
    },
    {
      label: "Completed Today",
      value: "01",
      detail: "Completed tasks still inform the history view.",
    },
    {
      label: "Weekly Rate",
      value: "78%",
      detail: "A lightweight progress signal for work ops.",
    },
  ],
};

export function listProjects() {
  return projects;
}

export function getProjectPreview(projectId: string) {
  return projects.find((project) => project.id === projectId) ?? null;
}

export function getProjectSelection(projectId?: string | null) {
  const project = projects.find((candidate) => candidate.id === projectId) ?? projects[0];

  return {
    projects,
    project,
  };
}

export function getDashboardPreview(projectId?: string | null): DashboardPreview {
  const selection = getProjectSelection(projectId);
  const projectTasks = tasks.filter((task) => task.projectId === selection.project.id);

  return {
    project: selection.project,
    projects: selection.projects,
    summary: summaryByProject[selection.project.id],
    tasks: projectTasks,
    history: historyByProject[selection.project.id],
  };
}
