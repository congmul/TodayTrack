import type { NextRequest } from "next/server";
import type { AuthProviderValue } from "@/lib/db/cosmos-schema";

export const oauthStateCookieName = "todaytrack_oauth_state";
export const oauthNonceCookieName = "todaytrack_oauth_nonce";
export const oauthProviderCookieName = "todaytrack_oauth_provider";
export const oauthRelayMaxAge = 60 * 10;

export function resolveAppBaseUrl(request: NextRequest) {
  return process.env.APP_BASE_URL?.trim() || request.nextUrl.origin;
}

export function parseOAuthProvider(value?: string | null): AuthProviderValue {
  return value === "google" ? "google" : "microsoft";
}
