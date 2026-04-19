import {
  AuthService,
  AuthServiceError,
} from "@/lib/services/auth-service";
import type {
  UpsertUserRecordInput,
  UserRecord,
  UserRepository,
} from "@/lib/db/user-repository";

function createRepositoryStub(
  overrides: Partial<UserRepository> = {},
): UserRepository {
  return {
    findById: vi.fn(),
    findByProviderUserId: vi.fn().mockResolvedValue(null),
    create: vi.fn(async (input: UpsertUserRecordInput) => createUserRecord(input)),
    update: vi.fn(async (user: UserRecord, input: UpsertUserRecordInput) => ({
      ...user,
      ...input,
      lastLoginAt: "2026-04-18T09:00:00.000Z",
      updatedAt: "2026-04-18T09:00:00.000Z",
    })),
    ...overrides,
  };
}

function createUserRecord(input: UpsertUserRecordInput): UserRecord {
  return {
    id: `${input.provider}:${input.providerUserId}`,
    kind: "user",
    provider: input.provider,
    providerUserId: input.providerUserId,
    selectedProjectId: null,
    email: input.email,
    displayName: input.displayName,
    avatarUrl: input.avatarUrl,
    lastLoginAt: "2026-04-18T08:00:00.000Z",
    createdAt: "2026-04-18T08:00:00.000Z",
    updatedAt: "2026-04-18T08:00:00.000Z",
  };
}

describe("AuthService", () => {
  it("creates a user when the Microsoft identity does not exist yet", async () => {
    const repository = createRepositoryStub();
    const service = new AuthService(repository);

    const result = await service.syncOAuthUser({
      provider: "microsoft",
      providerUserId: "microsoft-user-123",
      email: "hyun@example.com",
      displayName: "J. Hyun",
      avatarUrl: "https://example.com/avatar.png",
    });

    expect(result).toMatchObject({
      id: "microsoft:microsoft-user-123",
      providerUserId: "microsoft-user-123",
      email: "hyun@example.com",
      displayName: "J. Hyun",
    });
    expect(repository.create).toHaveBeenCalledWith({
      provider: "microsoft",
      providerUserId: "microsoft-user-123",
      email: "hyun@example.com",
      displayName: "J. Hyun",
      avatarUrl: "https://example.com/avatar.png",
    });
  });

  it("updates the last login when the Google identity already exists", async () => {
    const repository = createRepositoryStub({
      findByProviderUserId: vi.fn().mockResolvedValue(
        createUserRecord({
          provider: "google",
          providerUserId: "google-user-123",
          email: "old@example.com",
          displayName: "Old Name",
          avatarUrl: null,
        }),
      ),
    });
    const service = new AuthService(repository);

    const result = await service.syncOAuthUser({
      provider: "google",
      providerUserId: "google-user-123",
      email: "hyun@example.com",
      displayName: "J. Hyun",
    });

    expect(result).toMatchObject({
      providerUserId: "google-user-123",
      email: "hyun@example.com",
      displayName: "J. Hyun",
    });
    expect(repository.update).toHaveBeenCalled();
  });

  it("rejects missing provider ids", async () => {
    const service = new AuthService(createRepositoryStub());

    await expect(
      service.syncOAuthUser({
        provider: "microsoft",
        providerUserId: " ",
      }),
    ).rejects.toMatchObject<AuthServiceError>({
      code: "INVALID_INPUT",
    });
  });
});
