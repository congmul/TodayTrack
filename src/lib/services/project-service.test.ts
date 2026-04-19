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
    findById: vi.fn(),
    findByName: vi.fn().mockResolvedValue(null),
    listByUserId: vi.fn().mockResolvedValue([]),
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
    userId: input.userId,
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

    const result = await service.createProject("microsoft:user-123", {
      name: " Daily Reading ",
      description: " Build consistency ",
      type: "habit",
    });

    expect(result).toMatchObject({
      userId: "microsoft:user-123",
      name: "Daily Reading",
      description: "Build consistency",
      type: "habit",
      status: "active",
    });
    expect(repository.create).toHaveBeenCalledWith({
      userId: "microsoft:user-123",
      name: "Daily Reading",
      description: "Build consistency",
      type: "habit",
    });
  });

  it("rejects invalid project types", async () => {
    const service = new ProjectService(createRepositoryStub());

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
      listByUserId: vi.fn().mockResolvedValue([
        createProjectRecord({
          userId: "microsoft:user-123",
          name: "Launch",
          type: "task",
        }),
      ]),
    });
    const service = new ProjectService(repository);

    const result = await service.listProjects("microsoft:user-123");

    expect(result).toEqual([
      expect.objectContaining({
        userId: "microsoft:user-123",
        name: "Launch",
        type: "task",
      }),
    ]);
  });

  it("returns a project detail response only for the owning user", async () => {
    const repository = createRepositoryStub({
      findById: vi
        .fn()
        .mockResolvedValueOnce(
          createProjectRecord({
            userId: "microsoft:user-123",
            name: "Morning Routine",
            type: "habit",
          }),
        )
        .mockResolvedValueOnce(
          createProjectRecord({
            userId: "google:other",
            name: "Other Project",
            type: "task",
          }),
        ),
    });
    const service = new ProjectService(repository);

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
            userId: "microsoft:user-123",
            name: "Morning Routine",
            type: "habit",
          }),
        ),
    });
    const service = new ProjectService(repository);

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
          userId: "microsoft:user-123",
          name: "Morning Routine",
          type: "habit",
        }),
      ),
    });
    const service = new ProjectService(repository);

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
          userId: "microsoft:user-123",
          name: "Morning Routine",
          type: "habit",
        }),
      ),
    });
    const service = new ProjectService(repository);

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
          userId: "microsoft:user-123",
          name: "Morning Routine",
          type: "habit",
        }),
      ),
    });
    const service = new ProjectService(repository);

    await service.deleteProject("project_123", "microsoft:user-123");

    expect(repository.delete).toHaveBeenCalledWith(
      expect.objectContaining({ id: "project_123" }),
    );
  });
});
