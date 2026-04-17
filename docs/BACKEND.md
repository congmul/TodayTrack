# Backend Notes

This document keeps simple backend structure notes for TodayTrack.

## Backend Direction

- Keep frontend and backend in the same repo
- Prefer clear domain boundaries: accounts, projects, tasks, task history
- Keep APIs predictable and easy to test

## API Rules

- Use route handlers or API routes consistently
- Keep endpoint naming aligned with product concepts
- Validate request input before writing data
- Return clear error responses

## Data Rules

- Use Prisma as the ORM layer
- Use PostgreSQL as the main database
- Keep history data reliable because analytics depend on it
- Prefer explicit schema changes through migrations

## Backend Quality Notes

- Separate business logic from request handling where practical
- Add tests for important task and history behavior
- Keep account and project access rules clear
- Avoid hidden side effects in write endpoints
