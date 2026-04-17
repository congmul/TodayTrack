import {
  ProjectService,
  ProjectServiceError,
} from "@/lib/services/project-service";
import type {
  CreateProjectRecordInput,
  ProjectRecord,
  ProjectRepository,
} from "@/lib/db/project-repository";

function createRepositoryStub(overrides: Partial<ProjectRepository> = {}): ProjectRepository {
  return {
    accountExists: vi.fn().mockResolvedValue(true),
    findById: vi.fn(),
    findByName: vi.fn().mockResolvedValue(null),
    listByAccountId: vi.fn().mockResolvedValue([]),
    create: vi.fn(async (input: CreateProjectRecordInput) => createProjectRecord(input)),
    ...overrides,
  };
}

function createProjectRecord(input: CreateProjectRecordInput): ProjectRecord {
  return {
    id: "project_123",
    kind: "project",
    accountId: input.accountId,
    name: input.name,
    description: input.description ?? null,
    type: input.type,
    status: "active",
    alertEnabled: false,
    createdAt: "2026-04-17T12:00:00.000Z",
    updatedAt: "2026-04-17T12:00:00.000Z",
  };
}

describe("ProjectService", () => {
  it("creates a habit project with normalized output", async () => {
    const repository = createRepositoryStub();
    const service = new ProjectService(repository);

    const result = await service.createProject({
      accountId: "account_123",
      name: " Daily Reading ",
      description: " Build consistency ",
      type: "habit",
    });

    expect(result).toMatchObject({
      accountId: "account_123",
      name: "Daily Reading",
      description: "Build consistency",
      type: "habit",
      status: "active",
    });
    expect(repository.create).toHaveBeenCalledWith({
      accountId: "account_123",
      name: "Daily Reading",
      description: "Build consistency",
      type: "habit",
    });
  });

  it("rejects invalid project types", async () => {
    const service = new ProjectService(createRepositoryStub());

    const action = service.createProject({
      accountId: "account_123",
      name: "Errands",
      type: "calendar",
    });

    await expect(action).rejects.toMatchObject<ProjectServiceError>({
      code: "INVALID_INPUT",
    });
  });

  it("rejects missing accounts for create and list operations", async () => {
    const repository = createRepositoryStub({
      accountExists: vi.fn().mockResolvedValue(false),
    });
    const service = new ProjectService(repository);

    await expect(
      service.createProject({
        accountId: "missing_account",
        name: "Housework",
        type: "task",
      }),
    ).rejects.toMatchObject<ProjectServiceError>({
      code: "ACCOUNT_NOT_FOUND",
    });

    await expect(service.listProjects("missing_account")).rejects.toMatchObject<ProjectServiceError>({
      code: "ACCOUNT_NOT_FOUND",
    });
  });

  it("lists projects in API-friendly lowercase types", async () => {
    const repository = createRepositoryStub({
      listByAccountId: vi.fn().mockResolvedValue([
        createProjectRecord({
          accountId: "account_123",
          name: "Launch",
          type: "task",
        }),
      ]),
    });
    const service = new ProjectService(repository);

    const result = await service.listProjects("account_123");

    expect(result).toEqual([
      expect.objectContaining({
        name: "Launch",
        type: "task",
      }),
    ]);
  });

  it("returns a project detail response and errors when missing", async () => {
    const repository = createRepositoryStub({
      findById: vi
        .fn()
        .mockResolvedValueOnce(
          createProjectRecord({
            accountId: "account_123",
            name: "Morning Routine",
            type: "habit",
          }),
        )
        .mockResolvedValueOnce(null),
    });
    const service = new ProjectService(repository);

    await expect(service.getProject("project_123")).resolves.toMatchObject({
      name: "Morning Routine",
      type: "habit",
    });

    await expect(service.getProject("missing_project")).rejects.toMatchObject<ProjectServiceError>({
      code: "PROJECT_NOT_FOUND",
    });
  });

  it("rejects duplicate project names within the same account", async () => {
    const repository = createRepositoryStub({
      findByName: vi
        .fn()
        .mockResolvedValue(
          createProjectRecord({
            accountId: "account_123",
            name: "Morning Routine",
            type: "habit",
          }),
        ),
    });
    const service = new ProjectService(repository);

    await expect(
      service.createProject({
        accountId: "account_123",
        name: "Morning Routine",
        type: "habit",
      }),
    ).rejects.toMatchObject<ProjectServiceError>({
      code: "PROJECT_NAME_CONFLICT",
    });
  });
});
