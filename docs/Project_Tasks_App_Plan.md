# Project Tasks App Plan

## Product Goal

Build a mobile-first web app that lets a user manage tasks inside a project they own.

The app should also be delivered as a PWA so it feels natural for daily use on mobile and can be installed on supported devices.

Core user flow:
- The user opens the app on mobile or desktop
- The user opens a project
- The app shows today's tasks
- The user toggles a task as done or not done
- Completed tasks are shown with crossed-out titles
- The user clicks or taps a task to open task details
- The user sees historical completion results in graph form

---

## Suggested Product Scope

### Must-Have V1

- User-level workspace
- Project list for the signed-in user
- Task list for a selected project
- "Today's tasks" view
- Task status toggle: done / not done
- Crossed-out task title when done
- Task detail panel or page
- Completion history graph
- Create and edit task details
- Basic due date support
- Responsive UI with mobile-first design
- PWA enabled with install support
- App manifest, icons, and theme configuration

### Strongly Recommended Additions

- Search and filter by status, due date, and assignee
- Task priority: low, medium, high
- Task categories or tags
- Notes / description / checklist items inside each task
- Audit history: who changed status and when
- Project progress summary
- Empty states and onboarding flow
- Offline-friendly read experience for core screens

### Good Next-Step Features

- Recurring tasks
- Reminders / notifications
- Calendar view
- Weekly summary dashboard
- Comment thread on a task
- Attachments
- Role-based permissions
- Background sync for queued task updates

---

## Product Thinking

### Main Screens

1. Mobile home / today view
- This should be the primary screen
- Show today's tasks for the selected project
- Prioritize quick toggle actions and tap-friendly layout
- Support sticky actions or bottom navigation on mobile

2. Projects dashboard
- Show projects for the current user
- Show summary cards: overdue, due today, completed today, completion rate

3. Project tasks page
- Main list for today's tasks
- Filter tabs: today, all, completed, overdue
- Toggle button per task
- Visual strike-through for completed items
- Quick indicators for priority and due date

4. Task details view
- Title
- Description
- Status
- Due date
- Priority
- Tags
- Activity history
- On mobile, prefer full screen or bottom-sheet behavior
- On desktop, side panel is the preferred experience

5. History / analytics page
- Daily completed tasks graph
- Completion rate by week
- Optional breakdown by project or tag

---

## Recommended Tech Direction

Because you want FE and BE in one place, the simplest approach is a monorepo with a single application platform.

### Recommended Stack

- Frontend: Next.js
- Backend: Next.js API routes or Route Handlers
- Database: Azure Cosmos DB for NoSQL
- Data access: Azure Cosmos DB JavaScript SDK with repository/service layers
- UI: React with a component library or custom UI
- Charts: Recharts
- Auth: Azure AD B2C or a simpler email-based auth for early MVP
- PWA: Next.js-compatible manifest and service worker setup

Why this is a good fit:
- FE and BE live in one repo
- Shared types are easy
- Azure deployment is straightforward
- GitHub Actions support is mature
- Good path from MVP to production
- PWA support can be added cleanly in the same app
- Cosmos DB free tier can support low-cost development

### Alternative Stack

- Frontend + backend in one repo using React + Node/Express
- Database: Azure Cosmos DB for NoSQL
- Host FE and BE separately on Azure

This works, but it adds more deployment and routing complexity than a Next.js full-stack app.

---

## Suggested Architecture

### Repo Structure

```text
project-root/
  app/
  components/
  lib/
  public/
  src/
  docs/
  .github/workflows/
```

### Main Modules

- Auth and user context
- Project management
- Task management
- Task history / audit events
- Dashboard analytics
- PWA configuration and offline behavior

### Data Flow

- UI calls internal API
- API validates user and project access
- API reads and writes documents in Azure Cosmos DB for NoSQL
- Task status changes also create history events
- Analytics page reads aggregated history data
- Client caches key assets and selected read flows for PWA support

---

## Data Model Proposal

The current direction is a Cosmos DB document model rather than a relational schema.

### User

- id
- kind = `user`
- provider
- providerUserId
- selectedProjectId
- email
- name
- createdAt

### Project

- id
- kind = `project`
- userId
- name
- description
- type
- status
- alertEnabled
- createdAt

### Task

- id
- kind = `task`
- projectId
- title
- description
- status
- priority
- dueDate
- completedAt
- createdBy
- assignedTo
- createdAt
- updatedAt

### TaskHistory

- id
- kind = `taskHistory`
- taskId
- changedBy
- eventType
- oldValue
- newValue
- createdAt

This history document set is important because your graph should be driven by real status-change events, not only the current task state.

---

## API Plan

### Core Endpoints

- `GET /api/projects`
- `GET /api/projects/:projectId/tasks`
- `GET /api/projects/:projectId/tasks/today`
- `GET /api/tasks/:taskId`
- `POST /api/projects/:projectId/tasks`
- `PATCH /api/tasks/:taskId`
- `PATCH /api/tasks/:taskId/toggle`
- `GET /api/projects/:projectId/analytics/completion-history`

### Important Behavior

- Toggle endpoint updates `status`
- When task becomes done:
  - set `completedAt`
  - add `TaskHistory` event
- When task becomes not done:
  - clear `completedAt`
  - add `TaskHistory` event
- For PWA support, read APIs should handle short-lived client caching carefully

---

## UI Behavior

### Mobile-First Design Principles

- Start layout design from phone screens first
- Optimize tap targets and spacing for one-handed use
- Put today's tasks at the center of the first-run experience
- Prefer bottom navigation, sticky actions, and simple gestures
- Expand thoughtfully for tablet and desktop rather than shrinking from desktop layouts

### Task List

- Checkbox or toggle control on each row
- Completed tasks use strike-through styling
- Keep completed tasks visible but visually muted
- Clicking or tapping a row opens details
- Avoid making the toggle and row click conflict
- Keep interactions snappy on slow mobile networks

### Task Details

- Open in side panel for fast workflow on desktop
- Use full page or bottom sheet fallback for mobile

### PWA Behavior

- Provide install prompt support where available
- Add manifest and app icons
- Cache shell assets for fast repeat launches
- Show graceful offline state when live task updates are unavailable
- Consider queued updates for future enhancement, but do not depend on them for MVP

### Graph Ideas

- Daily completed tasks for last 30 days
- Weekly completion rate
- Completed vs created trend
- Optional overdue trend

---

## What Else Is Good To Add

These are the highest-value additions beyond the feature list you gave:

### 1. Audit trail

Very useful for understanding when a task was completed and reopened.

### 2. Priority and overdue states

Without them, today's task list can become flat and hard to act on.

### 3. Project summary widgets

Examples:
- tasks due today
- overdue tasks
- completed this week
- completion rate

### 4. Filtering and search

This becomes important quickly once task count grows.

### 5. Recurring task support

A strong feature if this app is for routine operational work.

### 6. Offline-aware experience

Especially valuable because the app is intended to be used as a mobile-first PWA.

---

## Azure Deployment Plan

### Recommended Azure Services

- Azure App Service for the web app
- Azure Cosmos DB for NoSQL
- Azure Key Vault for secrets
- Azure Monitor / Application Insights for logs and telemetry
- Azure Storage only if attachments are added later

### Deployment Shape

Option A: Best MVP choice
- Deploy the Next.js app to Azure App Service
- Connect to Azure Cosmos DB for NoSQL

Option B: More cloud-native later
- Containerize app
- Deploy to Azure Container Apps

For an early version, App Service is simpler and faster.

---

## GitHub Pipeline Plan

### CI Pipeline

Trigger on:
- pull request
- push to main

Stages:
1. Install dependencies
2. Lint
3. Type check
4. Run tests
5. Build app

### CD Pipeline

Trigger on:
- merge to main

Stages:
1. Build production artifact
2. Inject environment variables from GitHub secrets
3. Deploy to Azure App Service
4. Run post-deploy health check

### GitHub Setup Needed

- GitHub Actions workflow files
- Branch protection on `main`
- Required PR checks
- Secrets for Azure credentials and Cosmos DB connection

---

## Delivery Plan

### Phase 1: Foundation

- Create Next.js app
- Add Cosmos DB integration
- Set up basic layout and navigation
- Create account, project, and task schema
- Add local development environment
- Add PWA baseline: manifest, icons, metadata, installability support

### Phase 2: Core Task Experience

- Build mobile-first navigation and layout
- Build project task list
- Build today's tasks view
- Add toggle done / not done
- Add crossed-out styling
- Build task detail view

### Phase 3: Analytics

- Record task history events
- Build completion history API
- Add graph components
- Add summary cards

### Phase 4: Production Readiness

- Auth and authorization
- Validation and error handling
- Logging and monitoring
- GitHub Actions CI/CD
- Azure deployment
- Offline states and PWA quality pass

---

## Non-Functional Requirements

- Mobile-first layout
- PWA installability
- Fast list rendering
- Clear status feedback after toggle
- Secure access by account/project
- Reliable audit history
- Easy deployment from GitHub to Azure
- Good usability on low-bandwidth mobile conditions

---

## Risks To Think About Early

- Defining what "today's tasks" means
- Multi-account permissions
- Avoiding accidental toggle changes
- Handling reopened tasks in analytics
- Keeping graph data accurate over time
- Defining the right offline behavior for a PWA without confusing users

Recommendation:
define "today's tasks" as tasks with due date today plus overdue unfinished tasks.
