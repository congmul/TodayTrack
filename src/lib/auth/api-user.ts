import { cookies } from "next/headers";
import { getCachedSession, authSessionCookieName } from "@/lib/auth/session-cache";

export async function getApiSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(authSessionCookieName)?.value;
  const session = getCachedSession(token);

  return session?.user ?? null;
}
