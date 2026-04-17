# Contributing Guide

This document defines the working rules for contributing to TodayTrack.

## Branch Naming Rules

### Features

When starting a new feature, create a branch using:

```text
feature/<feature-desc>
```

Examples:
- `feature/task-toggle`
- `feature/project-dashboard`
- `feature/pwa-install-prompt`

### Bug Fixes

When starting a bug fix, create a branch using:

```text
bugfix/<bug-desc>
```

Examples:
- `bugfix/task-filter-state`
- `bugfix/mobile-layout-overflow`
- `bugfix/history-chart-labels`

### Branch Naming Conventions

- Use lowercase letters
- Use hyphens instead of spaces or underscores
- Keep names short but descriptive
- Use one branch per focused unit of work

## Workflow Rules

### 1. Start From `main`

- Pull or sync the latest `main` before creating a branch
- Create the new branch from the current `main`

### 2. Keep Work Small and Focused

- One branch should represent one feature or one bug fix
- Avoid mixing refactors, unrelated cleanup, and product changes in the same branch
- If a task grows too large, split it into smaller feature branches

### 3. Add Tests

- New behavior should include tests
- Bug fixes should include a test that would have caught the bug
- Do not merge work that reduces test coverage without a clear reason

### 4. Verify Before Commit

Before committing, run the project checks that apply to the change.

Current baseline checks:
- `npm run lint`
- `npm test`
- `npm run build`

### 5. Commit Often, But Keep Commits Meaningful

- Make commits that represent a clear step in the work
- Avoid noisy “temporary” commits in shared history when possible
- Before merging, the branch history should be understandable

## Commit Message Rules

Use short, imperative commit messages.

Recommended style:

```text
<type>: <summary>
```

Suggested commit types:
- `feat`
- `fix`
- `docs`
- `test`
- `refactor`
- `chore`

Examples:
- `feat: add task toggle interactions`
- `fix: correct overdue task filtering`
- `docs: add contribution rules`
- `test: cover reopened task history behavior`

Commit message guidance:
- Start with a verb
- Keep the summary concise
- Describe what changed, not the whole backstory
- Use the body only when extra context is actually helpful

## Merge Rules

- Finish work on a branch before merging it into `main`
- Push the feature or bugfix branch to GitHub first
- Make sure checks pass before merging
- Merge back into `main` only after the branch is ready
- After merging, push the updated `main`

## Pull Request Expectations

If a pull request is used, it should clearly explain:
- what changed
- why it changed
- how it was tested
- any follow-up work that is still pending

## Code Quality Expectations

- Follow the product plan in `docs/Project_Tasks_App_Plan.md`
- Preserve mobile-first design decisions
- Preserve PWA support goals
- Prefer readable code over clever code
- Keep UI behavior consistent across mobile and desktop
- Do not introduce unrelated formatting or refactor churn unless needed

## Documentation Rules

- Update docs when workflow or architecture changes
- If the product plan changes, update the docs in `docs/`
- Add README notes when a new document becomes important for future contributors

## Recommended Contribution Flow

1. Sync `main`
2. Create a branch:
   `feature/<feature-desc>` or `bugfix/<bug-desc>`
3. Implement the change
4. Add or update tests
5. Run lint, tests, and build
6. Commit with a clear message
7. Push the branch
8. Merge into `main`
9. Push `main`
