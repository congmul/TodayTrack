import { GET, POST } from "@/app/api/projects/route";
import { ProjectServiceError } from "@/lib/services/project-service";

const mockListProjects = vi.fn();
const mockCreateProject = vi.fn();
const mockGetApiSessionUser = vi.fn();

vi.mock("@/lib/services/project-service", async () => {
  const actual = await vi.importActual<typeof import("@/lib/services/project-service")>(
    "@/lib/services/project-service",
  );

  return {
    ...actual,
    createProjectService: () => ({
      listProjects: mockListProjects,
      createProject: mockCreateProject,
    }),
  };
});

vi.mock("@/lib/auth/api-user", () => ({
  getApiSessionUser: (...args: unknown[]) => mockGetApiSessionUser(...args),
}));

describe("projects route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists projects for the signed-in user", async () => {
    mockGetApiSessionUser.mockResolvedValue({
      id: "microsoft:user-123",
      selectedProjectId: "project_1",
    });
    mockListProjects.mockResolvedValue([
      { id: "project_1", name: "Launch", type: "task", isSelected: true },
    ]);

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      projects: [{ id: "project_1", name: "Launch", type: "task", isSelected: true }],
    });
    expect(mockListProjects).toHaveBeenCalledWith(
      "microsoft:user-123",
      "project_1",
    );
  });

  it("creates a project for the signed-in user", async () => {
    mockGetApiSessionUser.mockResolvedValue({
      id: "microsoft:user-123",
      selectedProjectId: null,
    });
    mockCreateProject.mockResolvedValue({
      id: "project_1",
      name: "Launch",
      type: "task",
    });

    const response = await POST(
      new Request("http://localhost/api/projects", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name: "Launch",
          type: "task",
        }),
      }),
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      project: {
        id: "project_1",
        name: "Launch",
        type: "task",
      },
    });
    expect(mockCreateProject).toHaveBeenCalledWith("microsoft:user-123", {
      name: "Launch",
      description: undefined,
      type: "task",
    });
  });

  it("maps validation errors from project creation", async () => {
    mockGetApiSessionUser.mockResolvedValue({
      id: "microsoft:user-123",
      selectedProjectId: null,
    });
    mockCreateProject.mockRejectedValue(
      new ProjectServiceError("Project name is required.", "INVALID_INPUT"),
    );

    const response = await POST(
      new Request("http://localhost/api/projects", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          type: "task",
        }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Project name is required.",
    });
  });
});
