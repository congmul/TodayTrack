import { NextRequest, NextResponse } from "next/server";
import {
  buildAzureLoginUrl,
  createOAuthRelayValue,
} from "@/lib/auth/azure-oauth";
import { buildGoogleLoginUrl } from "@/lib/auth/google-oauth";
import {
  oauthNonceCookieName,
  oauthRelayMaxAge,
  oauthProviderCookieName,
  oauthStateCookieName,
  parseOAuthProvider,
  resolveAppBaseUrl,
} from "@/lib/auth/oauth-relay";
const isProduction = process.env.NODE_ENV === "production";

export async function GET(request: NextRequest) {
  const provider = parseOAuthProvider(request.nextUrl.searchParams.get("provider"));
  const state = createOAuthRelayValue();
  const nonce = createOAuthRelayValue();
  const appBaseUrl = resolveAppBaseUrl(request);
  const response = NextResponse.redirect(
    provider === "google"
      ? buildGoogleLoginUrl({
          appBaseUrl,
          state,
          nonce,
        })
      : buildAzureLoginUrl({
          appBaseUrl,
          state,
          nonce,
        }),
  );

  response.cookies.set({
    name: oauthStateCookieName,
    value: state,
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
    maxAge: oauthRelayMaxAge,
  });
  response.cookies.set({
    name: oauthNonceCookieName,
    value: nonce,
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
    maxAge: oauthRelayMaxAge,
  });
  response.cookies.set({
    name: oauthProviderCookieName,
    value: provider,
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
    maxAge: oauthRelayMaxAge,
  });

  return response;
}
