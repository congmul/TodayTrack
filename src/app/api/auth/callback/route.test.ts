import { GET } from "@/app/api/auth/callback/route";
import { NextRequest } from "next/server";
import {
  oauthNonceCookieName,
  oauthProviderCookieName,
  oauthStateCookieName,
} from "@/lib/auth/oauth-relay";

const mockSyncOAuthUser = vi.fn();
const mockCreateUserSession = vi.fn();
const mockApplySessionCookie = vi.fn();
const mockExchangeCodeForAzureProfile = vi.fn();
const mockExchangeCodeForGoogleProfile = vi.fn();

vi.mock("@/lib/services/auth-service", async () => {
  const actual = await vi.importActual<typeof import("@/lib/services/auth-service")>(
    "@/lib/services/auth-service",
  );

  return {
    ...actual,
    createAuthService: () => ({
      syncOAuthUser: mockSyncOAuthUser,
    }),
  };
});

vi.mock("@/lib/auth/session", () => ({
  createUserSession: (...args: unknown[]) => mockCreateUserSession(...args),
  applySessionCookie: (...args: unknown[]) => mockApplySessionCookie(...args),
}));

vi.mock("@/lib/auth/azure-oauth", () => ({
  exchangeCodeForAzureProfile: (...args: unknown[]) =>
    mockExchangeCodeForAzureProfile(...args),
}));

vi.mock("@/lib/auth/google-oauth", () => ({
  exchangeCodeForGoogleProfile: (...args: unknown[]) =>
    mockExchangeCodeForGoogleProfile(...args),
}));

describe("auth/callback route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("syncs the Microsoft user and redirects to today", async () => {
    mockExchangeCodeForAzureProfile.mockResolvedValue({
      providerUserId: "microsoft-user-123",
      email: "hyun@example.com",
      displayName: "J. Hyun",
      avatarUrl: null,
    });
    mockSyncOAuthUser.mockResolvedValue({
      id: "microsoft:microsoft-user-123",
      provider: "microsoft",
      providerUserId: "microsoft-user-123",
      email: "hyun@example.com",
      displayName: "J. Hyun",
      avatarUrl: null,
      lastLoginAt: "2026-04-18T08:00:00.000Z",
      createdAt: "2026-04-18T08:00:00.000Z",
      updatedAt: "2026-04-18T08:00:00.000Z",
    });
    mockCreateUserSession.mockReturnValue({
      token: "session-token",
      expiresAt: Date.now() + 1000,
    });

    const request = new NextRequest(
      "http://localhost:3000/api/auth/callback?code=oauth-code&state=expected-state",
      {
        headers: {
          cookie: `${oauthStateCookieName}=expected-state; ${oauthNonceCookieName}=expected-nonce; ${oauthProviderCookieName}=microsoft`,
        },
      },
    );

    const response = await GET(request);

    expect(mockExchangeCodeForAzureProfile).toHaveBeenCalledWith({
      code: "oauth-code",
      appBaseUrl: "http://localhost:3000",
      expectedNonce: "expected-nonce",
    });
    expect(mockSyncOAuthUser).toHaveBeenCalledWith({
      provider: "microsoft",
      providerUserId: "microsoft-user-123",
      email: "hyun@example.com",
      displayName: "J. Hyun",
      avatarUrl: null,
    });
    expect(mockCreateUserSession).toHaveBeenCalled();
    expect(mockApplySessionCookie).toHaveBeenCalledWith(
      expect.anything(),
      "session-token",
    );
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/today");
  });

  it("syncs the Google user and redirects to today", async () => {
    mockExchangeCodeForGoogleProfile.mockResolvedValue({
      providerUserId: "google-user-123",
      email: "hyun@gmail.com",
      displayName: "J. Hyun",
      avatarUrl: "https://example.com/avatar.png",
    });
    mockSyncOAuthUser.mockResolvedValue({
      id: "google:google-user-123",
      provider: "google",
      providerUserId: "google-user-123",
      email: "hyun@gmail.com",
      displayName: "J. Hyun",
      avatarUrl: "https://example.com/avatar.png",
      lastLoginAt: "2026-04-18T08:00:00.000Z",
      createdAt: "2026-04-18T08:00:00.000Z",
      updatedAt: "2026-04-18T08:00:00.000Z",
    });
    mockCreateUserSession.mockReturnValue({
      token: "session-token",
      expiresAt: Date.now() + 1000,
    });

    const request = new NextRequest(
      "http://localhost:3000/api/auth/callback?code=google-code&state=expected-state",
      {
        headers: {
          cookie: `${oauthStateCookieName}=expected-state; ${oauthNonceCookieName}=expected-nonce; ${oauthProviderCookieName}=google`,
        },
      },
    );

    const response = await GET(request);

    expect(mockExchangeCodeForGoogleProfile).toHaveBeenCalledWith({
      code: "google-code",
      appBaseUrl: "http://localhost:3000",
      expectedNonce: "expected-nonce",
    });
    expect(mockSyncOAuthUser).toHaveBeenCalledWith({
      provider: "google",
      providerUserId: "google-user-123",
      email: "hyun@gmail.com",
      displayName: "J. Hyun",
      avatarUrl: "https://example.com/avatar.png",
    });
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/today");
  });

  it("redirects back to login when the state is invalid", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/auth/callback?code=oauth-code&state=wrong-state",
      {
        headers: {
          cookie: `${oauthStateCookieName}=expected-state; ${oauthNonceCookieName}=expected-nonce; ${oauthProviderCookieName}=microsoft`,
        },
      },
    );

    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?error=invalid_state",
    );
  });
});
