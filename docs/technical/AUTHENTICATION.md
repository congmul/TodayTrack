# Authentication Flow

This document describes the current TodayTrack authentication design and the
runtime flow implemented in the application.

## Overview

TodayTrack supports two login providers:

- Microsoft login through the default Microsoft Entra ID OAuth flow
- Google login through a direct Google OAuth flow

Both providers end in the same TodayTrack backend callback and produce the same
app session shape.

## Routes

Authentication-related routes:

- `/login`
- `/api/auth/login`
- `/api/auth/callback`
- `/api/auth/session`
- `/account`

Protected app routes currently include:

- `/today`
- `/projects`
- `/projects/[projectId]`
- `/projects/new`
- `/history`
- `/account`

## Login Entry

The root route `/` checks for an existing TodayTrack session.

- If a valid session exists, redirect to `/today`
- If no valid session exists, redirect to `/login`

The `/login` page shows two buttons:

- `Continue with Microsoft`
- `Continue with Google`

Each button starts a provider-specific OAuth flow:

- `/api/auth/login?provider=microsoft`
- `/api/auth/login?provider=google`

## OAuth Start

When `/api/auth/login` is called, the backend creates short-lived relay values:

- `state`
- `nonce`
- `provider`

These are stored in HTTP-only cookies:

- `todaytrack_oauth_state`
- `todaytrack_oauth_nonce`
- `todaytrack_oauth_provider`

The backend then redirects the browser to the correct authorize endpoint for the
selected provider.

## Microsoft Flow

The Microsoft button uses the default Microsoft Entra ID OAuth configuration.

Expected environment values:

- `AZURE_OAUTH_CLIENT_ID`
- `AZURE_OAUTH_CLIENT_SECRET`
- `AZURE_OAUTH_AUTHORIZE_URL`
- `AZURE_OAUTH_TOKEN_URL`
- `AZURE_OAUTH_JWKS_URL`
- `AZURE_OAUTH_SCOPE`
- `AZURE_OAUTH_ISSUER` optional but recommended

High-level flow:

1. User clicks `Continue with Microsoft`
2. Browser navigates to `/api/auth/login?provider=microsoft`
3. Backend redirects to Microsoft Entra authorize endpoint
4. Microsoft redirects back to `/api/auth/callback`
5. Backend exchanges the authorization code for tokens
6. Backend verifies the Microsoft `id_token`
7. Backend extracts identity claims

## Google Flow

The Google button uses direct Google OAuth.

Expected environment values:

- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `GOOGLE_OAUTH_AUTHORIZE_URL`
- `GOOGLE_OAUTH_TOKEN_URL`
- `GOOGLE_OAUTH_JWKS_URL`
- `GOOGLE_OAUTH_SCOPE`
- `GOOGLE_OAUTH_ISSUER`

High-level flow:

1. User clicks `Continue with Google`
2. Browser navigates to `/api/auth/login?provider=google`
3. Backend redirects to Google authorize endpoint
4. Google redirects back to `/api/auth/callback`
5. Backend exchanges the authorization code for tokens
6. Backend verifies the Google `id_token`
7. Backend extracts identity claims

## Shared Callback

Both providers return to the same callback route:

- `/api/auth/callback`

The callback uses the relay cookies to validate and complete the flow.

Validation includes:

- `state` must match
- `nonce` must match
- token signature must verify against provider JWKS
- audience must match the configured client id
- token must not be expired
- issuer can be checked when configured

The selected provider is read from `todaytrack_oauth_provider`, and the backend
chooses the correct token exchange and token verification path.

## User Sync

After a provider profile is verified, the backend syncs the user into Cosmos DB.

Current storage model:

- database: `todaytrack`
- container: `users`

User documents store:

- internal id
- auth provider
- provider user id
- email
- display name
- avatar url
- last login time
- created/updated timestamps

Current provider values:

- `microsoft`
- `google`

Sync rules:

- If the user does not exist, create them
- If the user already exists, update profile metadata and `lastLoginAt`

## App Session

After user sync succeeds, TodayTrack creates its own app session.

Current session design:

- an opaque session token is created server-side
- session data is cached in server memory
- the token is written into an HTTP-only cookie:
  - `todaytrack_session`

The frontend can inspect the active app session through:

- `/api/auth/session`

This endpoint returns:

- the app session token
- user information
- expiration time

## Logout

Logout is exposed from the `/account` page.

When the logout action runs:

1. The cached TodayTrack session is removed
2. The `todaytrack_session` cookie is cleared
3. The user is redirected to `/login`

## Current Limitation

The current session cache is in-memory.

This is acceptable for:

- local development
- single-instance deployment

This is not sufficient for:

- multi-instance deployments
- distributed production session management

If the app moves to multiple instances, session storage should be moved to a
shared store such as Redis or another centralized session backend.
