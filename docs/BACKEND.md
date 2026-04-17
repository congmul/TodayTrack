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

- Use Azure Cosmos DB for NoSQL as the main database
- Model data explicitly as documents and containers
- Keep partition-key choices intentional and stable
- Put data access behind repository or service boundaries
- Keep history data reliable because analytics depend on it
- Prefer explicit schema definitions in code and docs

## Backend Quality Notes

- Separate business logic from request handling where practical
- Add tests for important task and history behavior
- Keep account and project access rules clear
- Avoid hidden side effects in write endpoints
