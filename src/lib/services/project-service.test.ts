import {
  ProjectService,
  ProjectServiceError,
} from "@/lib/services/project-service";
import type { ProjectMemberRepository } from "@/lib/db/project-member-repository";
import type {
  CreateProjectRecordInput,
  ProjectRecord,
  ProjectRepository,
} from "@/lib/db/project-repository";
import type { TaskRepository } from "@/lib/db/task-repository";
import type { UserRepository } from "@/lib/db/user-repository";

function createRepositoryStub(overrides: Partial<ProjectRepository> = {}): ProjectRepository {
  return {
    findById: vi.fn(),
    findByName: vi.fn().mockResolvedValue(null),
    listOwnedByUserId: vi.fn().mockResolvedValue([]),
    create: vi.fn(async (input: CreateProjectRecordInput) => createProjectRecord(input)),
    update: vi.fn(async (project, input) => ({
      ...project,
      ...input,
      updatedAt: "2026-04-18T12:00:00.000Z",
    })),
    delete: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function createProjectRecord(input: CreateProjectRecordInput): ProjectRecord {
  return {
    id: "project_123",
    kind: "project",
    ownerUserId: input.ownerUserId,
    name: input.name,
    description: input.description ?? null,
    type: input.type,
    status: "active",
    alertEnabled: false,
    createdAt: "2026-04-17T12:00:00.000Z",
    updatedAt: "2026-04-17T12:00:00.000Z",
  };
}

function createProjectMembersStub(
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
    deleteByProjectId: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function createTaskRepositoryStub(
  overrides: Partial<TaskRepository> = {},
): TaskRepository {
  return {
    countByProjectId: vi.fn().mockResolvedValue(0),
    deleteByProjectId: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function createUserRepositoryStub(
  overrides: Partial<UserRepository> = {},
): UserRepository {
  return {
    findById: vi.fn(),
    findByEmail: vi.fn().mockResolvedValue(null),
    findByProviderUserId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateWorkspace: vi.fn(),
    ...overrides,
  };
}

describe("ProjectService", () => {
  it("creates a habit project with normalized output", async () => {
    const repository = createRepositoryStub();
    const service = new ProjectService(
      repository,
      createProjectMembersStub(),
      createTaskRepositoryStub(),
      createUserRepositoryStub(),
    );

    const result = await service.createProject("microsoft:user-123", {
      name: " Daily Reading ",
      description: " Build consistency ",
      type: "habit",
    });

    expect(result).toMatchObject({
      ownerUserId: "microsoft:user-123",
      name: "Daily Reading",
      description: "Build consistency",
      type: "habit",
      status: "active",
      taskCount: 0,
      accessRole: "owner",
    });
    expect(repository.create).toHaveBeenCalledWith({
      ownerUserId: "microsoft:user-123",
      name: "Daily Reading",
      description: "Build consistency",
      type: "habit",
    });
  });

  it("rejects invalid project types", async () => {
    const service = new ProjectService(
      createRepositoryStub(),
      createProjectMembersStub(),
      createTaskRepositoryStub(),
      createUserRepositoryStub(),
    );

    const action = service.createProject("microsoft:user-123", {
      name: "Errands",
      type: "calendar",
    });

    await expect(action).rejects.toMatchObject<ProjectServiceError>({
      code: "INVALID_INPUT",
    });
  });

  it("lists projects for a user", async () => {
    const repository = createRepositoryStub({
      listOwnedByUserId: vi.fn().mockResolvedValue([
        createProjectRecord({
          ownerUserId: "microsoft:user-123",
          name: "Launch",
          type: "task",
        }),
      ]),
    });
    const service = new ProjectService(
      repository,
      createProjectMembersStub(),
      createTaskRepositoryStub(),
      createUserRepositoryStub(),
    );

    const result = await service.listProjects(
      "microsoft:user-123",
      "project_123",
    );

    expect(result).toEqual([
      expect.objectContaining({
        ownerUserId: "microsoft:user-123",
        name: "Launch",
        type: "task",
        isSelected: true,
      }),
    ]);
  });

  it("returns a project detail response only for the owning user", async () => {
    const repository = createRepositoryStub({
      findById: vi
        .fn()
        .mockResolvedValueOnce(
          createProjectRecord({
            ownerUserId: "microsoft:user-123",
            name: "Morning Routine",
            type: "habit",
          }),
        )
        .mockResolvedValueOnce(
          createProjectRecord({
            ownerUserId: "google:other",
            name: "Other Project",
            type: "task",
          }),
        ),
    });
    const service = new ProjectService(
      repository,
      createProjectMembersStub(),
      createTaskRepositoryStub(),
      createUserRepositoryStub(),
    );

    await expect(
      service.getProject("project_123", "microsoft:user-123"),
    ).resolves.toMatchObject({
      name: "Morning Routine",
      type: "habit",
    });

    await expect(
      service.getProject("project_123", "microsoft:user-123"),
    ).rejects.toMatchObject<ProjectServiceError>({
      code: "PROJECT_NOT_FOUND",
    });
  });

  it("rejects duplicate project names for the same user", async () => {
    const repository = createRepositoryStub({
      findByName: vi
        .fn()
        .mockResolvedValue(
          createProjectRecord({
            ownerUserId: "microsoft:user-123",
            name: "Morning Routine",
            type: "habit",
          }),
        ),
    });
    const service = new ProjectService(
      repository,
      createProjectMembersStub(),
      createTaskRepositoryStub(),
      createUserRepositoryStub(),
    );

    await expect(
      service.createProject("microsoft:user-123", {
        name: "Morning Routine",
        type: "habit",
      }),
    ).rejects.toMatchObject<ProjectServiceError>({
      code: "PROJECT_NAME_CONFLICT",
    });
  });

  it("updates a project with validated fields", async () => {
    const repository = createRepositoryStub({
      findById: vi.fn().mockResolvedValue(
          createProjectRecord({
            ownerUserId: "microsoft:user-123",
            name: "Morning Routine",
            type: "habit",
          }),
        ),
    });
    const service = new ProjectService(
      repository,
      createProjectMembersStub(),
      createTaskRepositoryStub(),
      createUserRepositoryStub(),
    );

    const result = await service.updateProject("project_123", "microsoft:user-123", {
      name: "Evening Routine",
      status: "archived",
      alertEnabled: true,
    });

    expect(result).toMatchObject({
      name: "Evening Routine",
      status: "archived",
      alertEnabled: true,
    });
  });

  it("rejects update requests without changes", async () => {
    const repository = createRepositoryStub({
      findById: vi.fn().mockResolvedValue(
          createProjectRecord({
            ownerUserId: "microsoft:user-123",
            name: "Morning Routine",
            type: "habit",
          }),
        ),
    });
    const service = new ProjectService(
      repository,
      createProjectMembersStub(),
      createTaskRepositoryStub(),
      createUserRepositoryStub(),
    );

    await expect(
      service.updateProject("project_123", "microsoft:user-123", {}),
    ).rejects.toMatchObject<ProjectServiceError>({
      code: "INVALID_INPUT",
    });
  });

  it("deletes an existing project for the owning user", async () => {
    const repository = createRepositoryStub({
      findById: vi.fn().mockResolvedValue(
          createProjectRecord({
            ownerUserId: "microsoft:user-123",
            name: "Morning Routine",
            type: "habit",
          }),
        ),
    });
    const service = new ProjectService(
      repository,
      createProjectMembersStub(),
      createTaskRepositoryStub(),
      createUserRepositoryStub(),
    );

    await service.deleteProject("project_123", "microsoft:user-123");

    expect(repository.delete).toHaveBeenCalledWith(
      expect.objectContaining({ id: "project_123" }),
    );
  });

  it("rejects project deletion for managers", async () => {
    const repository = createRepositoryStub({
      findById: vi.fn().mockResolvedValue(
        createProjectRecord({
          ownerUserId: "google:owner-1",
          name: "Shared Project",
          type: "task",
        }),
      ),
    });
    const projectMembers = createProjectMembersStub({
      findActive: vi.fn().mockResolvedValue({
        id: "invite_1",
        kind: "project-member",
        projectId: "project_123",
        userId: "microsoft:user-123",
        invitedEmail: "hyun@example.com",
        role: "manager",
        status: "active",
        invitedByUserId: "google:owner-1",
        createdAt: "2026-04-18T08:00:00.000Z",
        updatedAt: "2026-04-18T08:00:00.000Z",
      }),
    });
    const service = new ProjectService(
      repository,
      projectMembers,
      createTaskRepositoryStub(),
      createUserRepositoryStub(),
    );

    await expect(
      service.deleteProject("project_123", "microsoft:user-123"),
    ).rejects.toMatchObject<ProjectServiceError>({
      code: "PROJECT_DELETE_FORBIDDEN",
    });
  });

  it("creates an invite for a new email address", async () => {
    const repository = createRepositoryStub({
      findById: vi.fn().mockResolvedValue(
        createProjectRecord({
          ownerUserId: "microsoft:user-123",
          name: "Shared Project",
          type: "task",
        }),
      ),
    });
    const projectMembers = createProjectMembersStub({
      createPendingInvite: vi.fn().mockResolvedValue({
        id: "invite_1",
        kind: "project-member",
        projectId: "project_123",
        userId: null,
        invitedEmail: "friend@example.com",
        role: "manager",
        status: "pending",
        invitedByUserId: "microsoft:user-123",
        createdAt: "2026-04-18T08:00:00.000Z",
        updatedAt: "2026-04-18T08:00:00.000Z",
      }),
    });
    const service = new ProjectService(
      repository,
      projectMembers,
      createTaskRepositoryStub(),
      createUserRepositoryStub(),
    );

    const result = await service.inviteMember("project_123", "microsoft:user-123", {
      email: " friend@example.com ",
    });

    expect(result).toMatchObject({
      invitedEmail: "friend@example.com",
      status: "pending",
      role: "manager",
    });
  });

  it("removes a collaborator when requested by the owner", async () => {
    const repository = createRepositoryStub({
      findById: vi.fn().mockResolvedValue(
        createProjectRecord({
          ownerUserId: "microsoft:user-123",
          name: "Shared Project",
          type: "task",
        }),
      ),
    });
    const member = {
      id: "invite_1",
      kind: "project-member" as const,
      projectId: "project_123",
      userId: "google:user-999",
      invitedEmail: "friend@example.com",
      role: "manager" as const,
      status: "active" as const,
      invitedByUserId: "microsoft:user-123",
      createdAt: "2026-04-18T08:00:00.000Z",
      updatedAt: "2026-04-18T08:00:00.000Z",
    };
    const projectMembers = createProjectMembersStub({
      findById: vi.fn().mockResolvedValue(member),
    });
    const service = new ProjectService(
      repository,
      projectMembers,
      createTaskRepositoryStub(),
      createUserRepositoryStub(),
    );

    await service.removeMember("project_123", "microsoft:user-123", "invite_1");

    expect(projectMembers.delete).toHaveBeenCalledWith(member);
  });

  it("rejects collaborator removal for managers", async () => {
    const repository = createRepositoryStub({
      findById: vi.fn().mockResolvedValue(
        createProjectRecord({
          ownerUserId: "google:owner-1",
          name: "Shared Project",
          type: "task",
        }),
      ),
    });
    const projectMembers = createProjectMembersStub({
      findActive: vi.fn().mockResolvedValue({
        id: "invite_1",
        kind: "project-member",
        projectId: "project_123",
        userId: "microsoft:user-123",
        invitedEmail: "hyun@example.com",
        role: "manager",
        status: "active",
        invitedByUserId: "google:owner-1",
        createdAt: "2026-04-18T08:00:00.000Z",
        updatedAt: "2026-04-18T08:00:00.000Z",
      }),
    });
    const service = new ProjectService(
      repository,
      projectMembers,
      createTaskRepositoryStub(),
      createUserRepositoryStub(),
    );

    await expect(
      service.removeMember("project_123", "microsoft:user-123", "invite_1"),
    ).rejects.toMatchObject<ProjectServiceError>({
      code: "PROJECT_DELETE_FORBIDDEN",
    });
  });
});
