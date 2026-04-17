export type SummaryCard = {
  label: string;
  value: string;
  detail: string;
};

export type PreviewTask = {
  id: string;
  title: string;
  note: string;
  assignee: string;
  dueLabel: string;
  priority: "High" | "Medium" | "Low";
  tag: string;
  done: boolean;
};

export type HistoryPreview = {
  label: string;
  value: string;
  detail: string;
};

export type DashboardPreview = {
  projectName: string;
  summary: SummaryCard[];
  tasks: PreviewTask[];
  history: HistoryPreview[];
};

export function getDashboardPreview(): DashboardPreview {
  return {
    projectName: "Spring Launch",
    summary: [
      {
        label: "Due Today",
        value: "06",
        detail: "A focused queue built for the first mobile screen.",
      },
      {
        label: "Overdue",
        value: "02",
        detail: "Still visible so nothing slips out of the daily plan.",
      },
      {
        label: "Completed Today",
        value: "11",
        detail: "Completions and reopens will feed the history graph.",
      },
      {
        label: "Weekly Rate",
        value: "84%",
        detail: "This will later come from real task history analytics.",
      },
    ],
    tasks: [
      {
        id: "task-1",
        title: "Confirm final banner copy with the product team",
        note: "Quick approval needed before today’s release checklist closes.",
        assignee: "Mina",
        dueLabel: "Due today",
        priority: "High",
        tag: "Launch",
        done: false,
      },
      {
        id: "task-2",
        title: "Review reopened bugfix for onboarding screen",
        note: "Reopened items should remain visible inside the today view.",
        assignee: "Jon",
        dueLabel: "Overdue",
        priority: "High",
        tag: "QA",
        done: false,
      },
      {
        id: "task-3",
        title: "Update status notes for stakeholder standup",
        note: "Shows how completed work remains readable but visually muted.",
        assignee: "Ava",
        dueLabel: "Due today",
        priority: "Medium",
        tag: "Ops",
        done: true,
      },
      {
        id: "task-4",
        title: "Attach screenshots to the mobile testing checklist",
        note: "PWA-first usage should feel natural during repeated daily checks.",
        assignee: "Kai",
        dueLabel: "Due today",
        priority: "Low",
        tag: "Mobile",
        done: false,
      },
    ],
    history: [
      {
        label: "Daily completed tasks",
        value: "30 days",
        detail: "Planned chart range for the MVP analytics screen.",
      },
      {
        label: "Weekly completion rate",
        value: "By week",
        detail: "Makes trend shifts easier to understand than raw totals.",
      },
      {
        label: "Completed vs created",
        value: "Trend",
        detail: "Helps reveal whether new work is outpacing completed work.",
      },
    ],
  };
}
