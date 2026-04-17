# Feature: Task Project Behavior

## Goal
Help users complete real-world tasks on time.

## Description
In task projects, tasks are deadline-driven.

## User Story
As a user, I want to manage tasks with deadlines, so that I can complete them on time.

## Acceptance Criteria
- Tasks may have dueDate
- If dueDate passes and not completed → mark as overdue
- Overdue tasks are clearly highlighted
- Tasks can still be completed after overdue
- Alerts exist for:
  - due soon
  - overdue
- Alerts are opt-in/out

## UI Expectations
- Highlight urgency
- Show overdue clearly

## Notes
- No streak logic here