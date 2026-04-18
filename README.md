# TodayTrack

This repository keeps the working product plan in [docs/Project_Tasks_App_Plan.md](./docs/Project_Tasks_App_Plan.md).

Contribution rules live in [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md).

Area-specific notes live in:
- [docs/FRONTEND.md](./docs/FRONTEND.md)
- [docs/BACKEND.md](./docs/BACKEND.md)
- [docs/PIPELINE.md](./docs/PIPELINE.md)

Technical implementation documents live in:
- [docs/technical/AUTHENTICATION.md](./docs/technical/AUTHENTICATION.md)

Current product direction:
- Mobile-first task management experience
- PWA-enabled Next.js app
- Account -> project -> today's tasks workflow
- Task history and completion analytics

When making product or implementation decisions, use the plan in `docs/` as the source of truth first.


CODEX INSTRUCTION EXAMPLE
```
Read AGENTS.md first.

Implement Feature: Task Creation

File:
docs/features/02-task-creation.md

Scope:
- Only implement this feature
- Do not implement analytics or unrelated features

Deliver:
- schema
- API
- service logic
- tests
```
