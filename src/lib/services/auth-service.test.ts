import {
  AuthService,
  AuthServiceError,
} from "@/lib/services/auth-service";
import type { ProjectMemberRepository } from "@/lib/db/project-member-repository";
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
    findByEmail: vi.fn().mockResolvedValue(null),
    findByProviderUserId: vi.fn().mockResolvedValue(null),
    create: vi.fn(async (input: UpsertUserRecordInput) => createUserRecord(input)),
    update: vi.fn(async (user: UserRecord, input: UpsertUserRecordInput) => ({
      ...user,
      ...input,
      lastLoginAt: "2026-04-18T09:00:00.000Z",
      updatedAt: "2026-04-18T09:00:00.000Z",
    })),
    updateWorkspace: vi.fn(),
    ...overrides,
  };
}

function createProjectMemberRepositoryStub(): ProjectMemberRepository {
  return {
    listByProjectId: vi.fn().mockResolvedValue([]),
    listActiveByUserId: vi.fn().mockResolvedValue([]),
    listPendingByEmail: vi.fn().mockResolvedValue([]),
    findActive: vi.fn().mockResolvedValue(null),
    findPending: vi.fn().mockResolvedValue(null),
    findById: vi.fn().mockResolvedValue(null),
    createPendingInvite: vi.fn(),
    activateInvite: vi.fn(),
    delete: vi.fn().mockResolvedValue(undefined),
    deleteByProjectId: vi.fn(),
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
    const projectMembers = createProjectMemberRepositoryStub();
    const service = new AuthService(repository, projectMembers);

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
    const service = new AuthService(repository, createProjectMemberRepositoryStub());

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
    const service = new AuthService(
      createRepositoryStub(),
      createProjectMemberRepositoryStub(),
    );

    await expect(
      service.syncOAuthUser({
        provider: "microsoft",
        providerUserId: " ",
      }),
    ).rejects.toMatchObject<AuthServiceError>({
      code: "INVALID_INPUT",
    });
  });

  it("activates pending invites after a matching email signs in", async () => {
    const repository = createRepositoryStub();
    const projectMembers = createProjectMemberRepositoryStub();
    const pendingInvite = {
      id: "invite_1",
      kind: "project-member" as const,
      projectId: "project_task_home",
      userId: null,
      invitedEmail: "hyun@example.com",
      role: "manager" as const,
      status: "pending" as const,
      invitedByUserId: "microsoft:owner-1",
      createdAt: "2026-04-18T08:00:00.000Z",
      updatedAt: "2026-04-18T08:00:00.000Z",
    };
    projectMembers.listPendingByEmail = vi.fn().mockResolvedValue([pendingInvite]);
    projectMembers.activateInvite = vi.fn().mockResolvedValue({
      ...pendingInvite,
      userId: "google:google-user-123",
      status: "active",
    });

    const service = new AuthService(repository, projectMembers);

    await service.syncOAuthUser({
      provider: "google",
      providerUserId: "google-user-123",
      email: "hyun@example.com",
      displayName: "J. Hyun",
    });

    expect(projectMembers.listPendingByEmail).toHaveBeenCalledWith(
      "hyun@example.com",
    );
    expect(projectMembers.activateInvite).toHaveBeenCalledWith(
      pendingInvite,
      "google:google-user-123",
    );
  });

  it("still signs the user in when the projectMembers container is not available", async () => {
    const repository = createRepositoryStub();
    const projectMembers = createProjectMemberRepositoryStub();
    projectMembers.listPendingByEmail = vi
      .fn()
      .mockRejectedValue(new Error('Message: {"Errors":["Owner resource does not exist"]}'));

    const service = new AuthService(repository, projectMembers);

    await expect(
      service.syncOAuthUser({
        provider: "google",
        providerUserId: "google-user-123",
        email: "hyun@example.com",
        displayName: "J. Hyun",
      }),
    ).resolves.toMatchObject({
      id: "google:google-user-123",
      email: "hyun@example.com",
    });
  });
});
