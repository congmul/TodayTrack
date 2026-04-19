# AGENTS.md

This file gives high-level instructions to coding agents operating in this repository.

## Project Context

TodayTrack is a mobile-first, PWA-enabled task management app.

Core product shape:
- user -> project -> task workflow
- today's tasks is a primary experience
- task history powers analytics
- mobile-first UX is required
- frontend and backend live in the same repo

## Read These Docs First

Before making meaningful product, code, workflow, or architecture changes, read:
- `docs/Project_Tasks_App_Plan.md`
- `docs/CONTRIBUTING.md`
- `docs/FRONTEND.md`
- `docs/BACKEND.md`
- `docs/PIPELINE.md`

These documents are the main source of truth for repository rules.

## Agent Expectations

- Read the docs above before making major decisions
- Follow the repo docs instead of duplicating local assumptions
- Keep changes focused and update docs when repository rules change
- Add tests for new behavior and bug fixes
- If repo docs and direct user instructions conflict, follow the user and then update the docs if needed
