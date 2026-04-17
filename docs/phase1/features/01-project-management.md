# Feature: Project Management

## Goal
Allow users to create and manage projects with different behaviors.

## Description
Users can create projects that define how tasks behave. Each project has a type:
- habit
- task

The project type controls UI, analytics, and behavior.

## User Story
As a user, I want to create a project and choose its type, so that tasks behave according to my goal.

## Acceptance Criteria
- User can create a project
- User must select a project type: `habit` or `task`
- Project type is stored and cannot be null
- Project list is viewable
- Project detail page exists

## Notes
- Project type controls:
  - analytics
  - alerts
  - UI style