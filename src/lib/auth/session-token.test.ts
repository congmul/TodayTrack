import { createSessionToken, verifySessionToken } from "@/lib/auth/session-token";

describe("session-token", () => {
  it("creates and verifies a signed session token", async () => {
    const token = await createSessionToken({
      user: {
        id: "microsoft:microsoft-user-123",
        provider: "microsoft",
        providerUserId: "microsoft-user-123",
        email: "hyun@example.com",
        displayName: "J. Hyun",
        avatarUrl: null,
        lastLoginAt: "2026-04-18T00:00:00.000Z",
        createdAt: "2026-04-18T00:00:00.000Z",
        updatedAt: "2026-04-18T00:00:00.000Z",
      },
      expiresAt: Date.now() + 60_000,
    });

    await expect(verifySessionToken(token)).resolves.toMatchObject({
      sub: "microsoft:microsoft-user-123",
      provider: "microsoft",
    });
  });

  it("rejects expired tokens", async () => {
    const token = await createSessionToken({
      user: {
        id: "google:google-user-123",
        provider: "google",
        providerUserId: "google-user-123",
        email: "hyun@gmail.com",
        displayName: "J. Hyun",
        avatarUrl: null,
        lastLoginAt: "2026-04-18T00:00:00.000Z",
        createdAt: "2026-04-18T00:00:00.000Z",
        updatedAt: "2026-04-18T00:00:00.000Z",
      },
      expiresAt: Date.now() - 1000,
    });

    await expect(verifySessionToken(token)).resolves.toBeNull();
  });
});
