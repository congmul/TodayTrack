# Feature: Task Creation

## Goal
Allow users to create flexible tasks with optional scheduling.

## Description
A task belongs to a project and may include:
- title
- description
- dueDate (optional)
- repeatRule (optional)

## User Story
As a user, I want to create tasks inside a project, so that I can track both repeated and one-time tasks.

## Acceptance Criteria
- User can create a task within a project
- Task must have a title
- Task may have description
- Task may have dueDate
- Task may have repeatRule
- If repeatRule exists → repeating task
- If not → one-time task

## Notes
- No separate task type field
- Keep model simple