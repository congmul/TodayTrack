import { GET } from "@/app/api/auth/login/route";
import {
  oauthNonceCookieName,
  oauthProviderCookieName,
  oauthStateCookieName,
} from "@/lib/auth/oauth-relay";
import { NextRequest } from "next/server";

vi.mock("@/lib/auth/azure-oauth", () => ({
  createOAuthRelayValue: vi
    .fn()
    .mockReturnValueOnce("state-token")
    .mockReturnValueOnce("nonce-token"),
  buildAzureLoginUrl: vi.fn().mockReturnValue("https://login.example.com/oauth"),
}));

vi.mock("@/lib/auth/google-oauth", () => ({
  buildGoogleLoginUrl: vi.fn().mockReturnValue("https://accounts.google.com/o/oauth"),
}));

describe("auth/login route", () => {
  it("redirects to Microsoft Entra and stores relay cookies", async () => {
    const response = await GET(
      new NextRequest("http://localhost:3000/api/auth/login"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://login.example.com/oauth");
    expect(response.cookies.get(oauthStateCookieName)?.value).toBe("state-token");
    expect(response.cookies.get(oauthNonceCookieName)?.value).toBe("nonce-token");
    expect(response.cookies.get(oauthProviderCookieName)?.value).toBe("microsoft");
  });

  it("redirects to Google when the provider query is set", async () => {
    const response = await GET(
      new NextRequest("http://localhost:3000/api/auth/login?provider=google"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://accounts.google.com/o/oauth");
    expect(response.cookies.get(oauthProviderCookieName)?.value).toBe("google");
  });
});
