import {
  WorkspaceService,
  WorkspaceServiceError,
} from "@/lib/services/workspace-service";
import type { ProjectMemberRepository } from "@/lib/db/project-member-repository";
import type { ProjectRepository } from "@/lib/db/project-repository";
import type { UserRepository, UserRecord } from "@/lib/db/user-repository";

function createUser(overrides: Partial<UserRecord> = {}): UserRecord {
  return {
    id: "microsoft:user-123",
    kind: "user",
    provider: "microsoft",
    providerUserId: "user-123",
    selectedProjectId: null,
    email: "hyun@example.com",
    displayName: "J. Hyun",
    avatarUrl: null,
    lastLoginAt: "2026-04-18T10:00:00.000Z",
    createdAt: "2026-04-18T10:00:00.000Z",
    updatedAt: "2026-04-18T10:00:00.000Z",
    ...overrides,
  };
}

function createProject(id: string, userId = "microsoft:user-123") {
  return {
    id,
    kind: "project" as const,
    ownerUserId: userId,
    name: "Project",
    description: null,
    type: "task" as const,
    status: "active" as const,
    alertEnabled: false,
    createdAt: "2026-04-18T10:00:00.000Z",
    updatedAt: "2026-04-18T10:00:00.000Z",
  };
}

function createProjectMembers(
  overrides: Partial<ProjectMemberRepository> = {},
): ProjectMemberRepository {
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
    ...overrides,
  };
}

describe("WorkspaceService", () => {
  it("routes users without projects to the projects page", async () => {
    const users: UserRepository = {
      findById: vi.fn().mockResolvedValue(createUser()),
      findByEmail: vi.fn(),
      findByProviderUserId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateWorkspace: vi.fn(),
    };
    const projects: ProjectRepository = {
      findById: vi.fn(),
      findByName: vi.fn(),
      listOwnedByUserId: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    const projectMembers = createProjectMembers();

    const service = new WorkspaceService(users, projects, projectMembers);
    const result = await service.resolveLandingForUser("microsoft:user-123");

    expect(result.path).toBe("/projects");
  });

  it("routes users with projects to today and persists a default selection", async () => {
    const updatedUser = createUser({ selectedProjectId: "project_1" });
    const users: UserRepository = {
      findById: vi.fn().mockResolvedValue(createUser()),
      findByEmail: vi.fn(),
      findByProviderUserId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateWorkspace: vi.fn().mockResolvedValue(updatedUser),
    };
    const projects: ProjectRepository = {
      findById: vi.fn(),
      findByName: vi.fn(),
      listOwnedByUserId: vi.fn().mockResolvedValue([createProject("project_1")]),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    const projectMembers = createProjectMembers();

    const service = new WorkspaceService(users, projects, projectMembers);
    const result = await service.resolveLandingForUser("microsoft:user-123");

    expect(result.path).toBe("/today?project=project_1");
    expect(users.updateWorkspace).toHaveBeenCalledWith(
      expect.objectContaining({ id: "microsoft:user-123" }),
      { selectedProjectId: "project_1" },
    );
  });

  it("still resolves owned projects when shared-membership storage is unavailable", async () => {
    const updatedUser = createUser({ selectedProjectId: "project_1" });
    const users: UserRepository = {
      findById: vi.fn().mockResolvedValue(createUser()),
      findByEmail: vi.fn(),
      findByProviderUserId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateWorkspace: vi.fn().mockResolvedValue(updatedUser),
    };
    const projects: ProjectRepository = {
      findById: vi.fn(),
      findByName: vi.fn(),
      listOwnedByUserId: vi.fn().mockResolvedValue([createProject("project_1")]),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    const projectMembers = createProjectMembers({
      listActiveByUserId: vi
        .fn()
        .mockRejectedValue(new Error('Message: {"Errors":["Owner resource does not exist"]}')),
    });

    const service = new WorkspaceService(users, projects, projectMembers);
    const result = await service.resolveLandingForUser("microsoft:user-123");

    expect(result.path).toBe("/today?project=project_1");
    expect(users.updateWorkspace).toHaveBeenCalled();
  });

  it("rejects project selections that belong to another user", async () => {
    const users: UserRepository = {
      findById: vi.fn().mockResolvedValue(createUser()),
      findByEmail: vi.fn(),
      findByProviderUserId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateWorkspace: vi.fn(),
    };
    const projects: ProjectRepository = {
      findById: vi.fn().mockResolvedValue(createProject("project_other", "google:other")),
      findByName: vi.fn(),
      listOwnedByUserId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    const projectMembers = createProjectMembers();

    const service = new WorkspaceService(users, projects, projectMembers);

    await expect(
      service.updateSelectedProject("microsoft:user-123", "project_other"),
    ).rejects.toMatchObject<WorkspaceServiceError>({
      code: "PROJECT_NOT_FOR_USER",
    });
  });
});
