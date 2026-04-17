# Frontend Notes

This document keeps simple frontend structure and implementation rules for TodayTrack.

## Frontend Direction

- Build mobile-first first, then expand to tablet and desktop
- Keep the PWA experience feeling close to a real app
- Prefer clear navigation and page structure over hidden UI flows

## Styling Rules

- Avoid inline styles as much as possible
- Prefer CSS modules, global styles, or shared component styles
- Keep styling consistent across pages and components
- Do not mix multiple styling patterns without a good reason

## Navigation Rules

- Use routing when the feature is meaningfully different
- Do not pack unrelated experiences into one page
- Main navigation endpoints should be separate pages

Examples:
- `/today`
- `/projects`
- `/projects/[projectId]`
- `/history`
- `/settings`

Today and Projects should not be treated as the same route with only a UI toggle. They should have different navigation endpoints.

## Interaction Rules

- Avoid modals as soon as possible
- Prefer full pages, drawers, sheets, or inline expansion when they provide a clearer flow
- Use a modal only when it is truly the simplest and least disruptive choice

## Component Rules

- Keep components focused on one job
- Prefer reusable UI pieces when the same pattern appears in multiple places
- Avoid overly large page files with too much mixed logic

## Frontend Quality Notes

- Keep tap targets mobile-friendly
- Make loading, empty, and error states explicit
- Preserve accessibility for navigation, forms, and actions
- Keep task interactions fast and easy to understand
