# Feature: Repeat Scheduling Engine

## Goal
Calculate repeating task occurrences on the server.

## Description
Tasks may include a repeatRule. The server determines when tasks should occur.

## User Story
As a user, I want flexible repeat scheduling, so that tasks match my real routines.

## Acceptance Criteria
- Repeat rules are evaluated on the server
- Timezone is based on user
- Support:
  - daily
  - interval (every N days)
  - weekly (specific weekdays)
- Support startDate and optional endDate
- Generate expected occurrences per day

## Missed Logic
- If a scheduled occurrence is not completed by end of day → mark as missed
- Day boundary uses user timezone

## Notes
- No partial completion