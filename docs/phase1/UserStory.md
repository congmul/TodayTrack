# TodayTrack - User Story

## CODEX INSTRUCTION
```
Implementation direction:
- Keep one Task model
- Use projectType to control behavior and UI
- Use optional repeatRule instead of task type
- Use server-side repeat calculation
- Use user timezone for day boundaries
- No partial completion
- Streak resets when missed
```

## Product Overview
TodayTrack is a task tracking app that helps users manage two different kinds of projects:

1. **Habit Projects**  
   These are used to build consistency and track repeated actions over time.  
   Example: reading an English paragraph every day or every two days.

2. **Task Projects**  
   These are used for practical real-life tasks that may have due dates and overdue status.  
   Example: emptying the trash can, cleaning the bathroom, or buying milk.

The system should keep the **task model simple**.  
A task itself does not need a separate "recurring" or "one-time" type.  
Instead:

- a task may have a **repeat rule**
- a task may have a **due date**
- the **project type** determines the behavior, UI, and analysis logic

---

## Core Concepts

### Project Types
The app supports two project types:

- `habit`
- `task`

### Task Rules
A task can be:

- a repeating task if it has a `repeatRule`
- a one-time task if it has no `repeatRule`

A project can contain both repeating and non-repeating tasks, but the UI should allow filtering them separately.

---

## Functional Goals

### Habit Project Goal
Help users track consistency over time without creating pressure.

Important behavior:
- missed tasks are recorded automatically
- missed tasks should **not** trigger warnings or alerts
- analysis should focus on **completion rate**
- streaks should be supported
- if a streak is broken, it restarts from zero

### Task Project Goal
Help users complete real-world tasks on time.

Important behavior:
- due dates matter
- overdue tasks should be clearly highlighted
- alerts/reminders should be supported as an opt-in or opt-out feature
- a task can still be completed after it becomes overdue

---

## Time and Scheduling Rules

### Timezone
All task scheduling and date calculations are based on the **user's local timezone**.

### Repeat Rule Calculation
Repeat rules must be calculated on the **server**.

### Supported Repeat Patterns
The app should support flexible repeat rules, including:

- every day
- every few days, such as every 2 days
- weekly patterns
- custom date ranges
- recurring schedules across weeks, months, and years

Examples:
- every day
- every 2 days
- every Monday and Thursday
- every week for 3 months

### Missed Task Logic
For repeating tasks, if a scheduled occurrence is not completed by the end of the relevant day in the user's timezone, it is automatically recorded as missed.

---

## UI Requirements

### Project-Level UI
The app should show different experiences based on project type.

#### Habit Project UI
Should emphasize:
- consistency
- completion rate
- progress over time
- streak tracking

Should avoid:
- warning-heavy language
- overdue alerts

#### Task Project UI
Should emphasize:
- deadlines
- due soon items
- overdue items
- actionable alerts

### Task Display
Inside a project, tasks should be filterable by:
- repeating tasks
- non-repeating tasks
- all tasks

### Today View
The app should provide a "Today" view that helps users focus on what matters now.

The Today view should include:
- habit tasks expected today
- task-project items due today
- overdue task-project items

---

## Analytics Requirements

### Habit Project Analytics
The analysis page should show:
- completion rate for a selected range
- missed rate for a selected range
- streak information
- history by custom range:
  - weekly
  - monthly
  - yearly

The main metric is:
- completed tasks out of expected tasks for the selected period

Example:
- "You completed 18 out of 20 expected tasks this week."
- "You missed 10% of your expected habit tasks this month."

### Task Project Analytics
The analysis page should show:
- completed tasks
- open tasks
- overdue tasks
- due soon tasks if applicable

The main focus is operational visibility, not consistency.

---

## User Stories

### 1. Create Project
**As a user**, I want to create a project and choose its type, so that the app can provide the right behavior and analysis for my goals.

#### Acceptance Criteria
- The user can create a project.
- The user must choose a project type: `habit` or `task`.
- The project type affects UI, analytics, and alert behavior.

---

### 2. Create Task
**As a user**, I want to create tasks inside a project, so that I can track both repeated activities and one-time work.

#### Acceptance Criteria
- A user can create a task within a project.
- A task has a title.
- A task may optionally have a description.
- A task may optionally have a due date.
- A task may optionally have a repeat rule.
- If a task has no repeat rule, it is treated as a one-time task.
- If a task has a repeat rule, it is treated as a repeating task.

---

### 3. Manage Repeat Rules
**As a user**, I want to define flexible repeat schedules, so that the app matches my real routines.

#### Acceptance Criteria
- The user can set a repeat rule for a task.
- The repeat rule supports custom intervals such as every 2 days.
- The repeat rule supports weekly and longer recurring patterns.
- The repeat rule is evaluated on the server.
- The repeat rule respects the user's timezone.

---

### 4. Track Habit Project Progress
**As a user**, I want to track consistency in a habit project, so that I can improve my routines without feeling punished for missing a day.

#### Acceptance Criteria
- Repeating tasks in a habit project can be marked complete for a scheduled day.
- If a scheduled occurrence is not completed by the end of the day, it is marked as missed automatically.
- Missed habit tasks do not trigger alerts or warnings.
- The app shows completion rate based on expected vs completed tasks.
- The app supports streak tracking.
- If a streak is broken, the streak restarts.

---

### 5. Manage Real Tasks in Task Project
**As a user**, I want to manage practical tasks in a task project, so that I can complete important work before or after due dates.

#### Acceptance Criteria
- A task in a task project can have a due date.
- If the due date passes and the task is not completed, it is marked overdue.
- Overdue tasks are clearly highlighted in the UI.
- The user can still complete an overdue task later.
- Alerts for due soon or overdue tasks are available.
- Alerts can be turned on or off by the user.

---

### 6. Filter Tasks in a Project
**As a user**, I want to filter tasks in a project, so that I can focus on repeating tasks, one-time tasks, or all tasks.

#### Acceptance Criteria
- The user can view all tasks in a project.
- The user can filter repeating tasks only.
- The user can filter non-repeating tasks only.
- Filtering does not change the underlying task model.

---

### 7. Use a Today View
**As a user**, I want to see what matters today, so that I can quickly act on my daily habits and real tasks.

#### Acceptance Criteria
- The Today view shows habit tasks expected today.
- The Today view shows task-project tasks due today.
- The Today view shows overdue task-project tasks.
- The Today view uses the user's timezone.

---

### 8. View Analytics
**As a user**, I want to see analytics for my projects, so that I can understand my consistency and task completion performance.

#### Acceptance Criteria
- Habit project analytics show expected, completed, and missed tasks.
- Habit project analytics support weekly, monthly, and yearly ranges.
- Habit project analytics show streak information.
- Task project analytics show open, completed, overdue, and due soon tasks.
- Analytics differ depending on project type.

---

## Suggested Domain Rules

### Project
A project contains many tasks and has one project type:
- `habit`
- `task`

### Task
A task belongs to a project and may include:
- title
- description
- dueDate
- repeatRule
- completion records

### Completion Rules
- Partial completion is not needed.
- Completion is binary: completed or not completed.
- Repeating tasks create scheduled occurrences conceptually based on repeat rules.
- Missed repeating occurrences are recorded automatically after the day ends in the user's timezone.

---

## Non-Functional Expectations
- Date-sensitive behavior must be accurate per user timezone.
- Repeat rule evaluation must be handled on the server.
- The design should remain extensible for future reporting and notification features.
- The UI should feel lighter for habit projects and more actionable for task projects.

---

## Summary
TodayTrack should support a simple task model with flexible scheduling, while project type controls the user experience:

- **Habit projects** focus on consistency, completion rate, and streaks
- **Task projects** focus on due dates, alerts, and overdue visibility

This allows the app to handle both personal habit tracking and practical task management without overcomplicating the task structure.