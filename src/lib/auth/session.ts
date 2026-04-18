import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  authSessionCookieName,
  authSessionTtlMs,
  createCachedSession,
  deleteCachedSession,
  getCachedSession,
} from "@/lib/auth/session-cache";
import type { AuthUserDto } from "@/lib/services/auth-service";

const isProduction = process.env.NODE_ENV === "production";

export async function getServerSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(authSessionCookieName)?.value;

  return getCachedSession(token);
}

export async function requireServerSession() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export function createUserSession(user: AuthUserDto) {
  return createCachedSession(user);
}

export function applySessionCookie(
  response: {
    cookies: {
      set: (options: {
        name: string;
        value: string;
        httpOnly: boolean;
        sameSite: "lax";
        secure: boolean;
        path: string;
        maxAge: number;
      }) => void;
    };
  },
  token: string,
) {
  response.cookies.set({
    name: authSessionCookieName,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
    maxAge: Math.floor(authSessionTtlMs / 1000),
  });
}

export async function clearServerSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(authSessionCookieName)?.value;

  deleteCachedSession(token);
  cookieStore.delete(authSessionCookieName);
}
