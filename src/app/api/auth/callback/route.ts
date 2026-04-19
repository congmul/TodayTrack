import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForAzureProfile } from "@/lib/auth/azure-oauth";
import { exchangeCodeForGoogleProfile } from "@/lib/auth/google-oauth";
import {
  oauthNonceCookieName,
  oauthProviderCookieName,
  oauthStateCookieName,
  parseOAuthProvider,
  resolveAppBaseUrl,
} from "@/lib/auth/oauth-relay";
import { applySessionCookie, createUserSession } from "@/lib/auth/session";
import { createAuthService } from "@/lib/services/auth-service";

export async function GET(request: NextRequest) {
  const state = request.nextUrl.searchParams.get("state");
  const code = request.nextUrl.searchParams.get("code");
  const oauthError = request.nextUrl.searchParams.get("error");
  const storedState = request.cookies.get(oauthStateCookieName)?.value;
  const storedNonce = request.cookies.get(oauthNonceCookieName)?.value ?? "";
  const provider = parseOAuthProvider(
    request.cookies.get(oauthProviderCookieName)?.value,
  );

  if (oauthError) {
    return redirectToLogin(request, "oauth_error");
  }

  if (!code || !state || !storedState || state !== storedState) {
    return redirectToLogin(request, "invalid_state");
  }

  try {
    const appBaseUrl = resolveAppBaseUrl(request);
    const profile =
      provider === "google"
        ? await exchangeCodeForGoogleProfile({
            code,
            appBaseUrl,
            expectedNonce: storedNonce,
          })
        : await exchangeCodeForAzureProfile({
            code,
            appBaseUrl,
            expectedNonce: storedNonce,
          });
    const service = createAuthService();
    const user = await service.syncOAuthUser({
      provider,
      ...profile,
    });
    const session = await createUserSession(user);
    const response = NextResponse.redirect(new URL("/today", request.url));

    applySessionCookie(response, session.token);
    clearOAuthCookies(response);

    return response;
  } catch (error) {
    console.error(error);
    return redirectToLogin(request, "login_failed");
  }
}

function redirectToLogin(request: NextRequest, reason: string) {
  const response = NextResponse.redirect(
    new URL(`/login?error=${reason}`, request.url),
  );

  clearOAuthCookies(response);

  return response;
}

function clearOAuthCookies(response: NextResponse) {
  response.cookies.delete(oauthStateCookieName);
  response.cookies.delete(oauthNonceCookieName);
  response.cookies.delete(oauthProviderCookieName);
}
