# Pipeline Notes

This document keeps simple CI/CD and delivery notes for TodayTrack.

## Pipeline Direction

- Keep the pipeline easy to understand
- Make failures obvious and actionable
- Protect `main` with required checks

## CI Rules

- Run on pull requests
- Run on pushes to `main`
- At minimum run:
  - install
  - lint
  - test
  - build

## CD Rules

- Deploy only from `main`
- Keep secrets in GitHub secrets or Azure-managed services
- Run a post-deploy health check when deployment is added

## Pipeline Quality Notes

- Keep workflow files small and readable
- Do not skip checks without a clear reason
- Prefer fast feedback for contributors
- Document any new required secret or environment variable
