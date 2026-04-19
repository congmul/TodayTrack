import type { AuthUserDto } from "@/lib/services/auth-service";
import { createSessionToken } from "@/lib/auth/session-token";

export const authSessionCookieName = "todaytrack_session";
export const authSessionTtlMs = 1000 * 60 * 60 * 8;

export type CachedAuthSession = {
  token: string;
  user: AuthUserDto;
  expiresAt: number;
};

const globalForAuthCache = globalThis as typeof globalThis & {
  todayTrackAuthSessions?: Map<string, CachedAuthSession>;
};

function getSessionStore() {
  if (!globalForAuthCache.todayTrackAuthSessions) {
    globalForAuthCache.todayTrackAuthSessions = new Map();
  }

  return globalForAuthCache.todayTrackAuthSessions;
}

export async function createCachedSession(user: AuthUserDto) {
  pruneExpiredSessions();

  const expiresAt = Date.now() + authSessionTtlMs;
  const token = await createSessionToken({
    user,
    expiresAt,
  });
  const session = {
    token,
    user,
    expiresAt,
  };

  getSessionStore().set(token, session);

  return session;
}

export function getCachedSession(token?: string | null) {
  if (!token) {
    return null;
  }

  const session = getSessionStore().get(token);
  if (!session) {
    return null;
  }

  if (session.expiresAt <= Date.now()) {
    getSessionStore().delete(token);
    return null;
  }

  return session;
}

export function deleteCachedSession(token?: string | null) {
  if (!token) {
    return;
  }

  getSessionStore().delete(token);
}

function pruneExpiredSessions() {
  const now = Date.now();

  for (const [token, session] of getSessionStore()) {
    if (session.expiresAt <= now) {
      getSessionStore().delete(token);
    }
  }
}
