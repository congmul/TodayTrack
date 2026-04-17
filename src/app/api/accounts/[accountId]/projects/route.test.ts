import { GET, POST } from "@/app/api/accounts/[accountId]/projects/route";
import { ProjectServiceError } from "@/lib/services/project-service";

const mockService = {
  listProjects: vi.fn(),
  createProject: vi.fn(),
};

vi.mock("@/lib/services/project-service", async () => {
  const actual = await vi.importActual<typeof import("@/lib/services/project-service")>(
    "@/lib/services/project-service",
  );

  return {
    ...actual,
    createProjectService: () => mockService,
  };
});

describe("accounts/[accountId]/projects route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists projects for an account", async () => {
    mockService.listProjects.mockResolvedValue([
      { id: "project_1", name: "Launch", type: "task" },
    ]);

    const response = await GET(new Request("http://localhost/api/accounts/account_1/projects"), {
      params: Promise.resolve({ accountId: "account_1" }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      projects: [{ id: "project_1", name: "Launch", type: "task" }],
    });
  });

  it("creates a project and returns 201", async () => {
    mockService.createProject.mockResolvedValue({
      id: "project_1",
      name: "Morning Routine",
      type: "habit",
    });

    const request = new Request("http://localhost/api/accounts/account_1/projects", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        name: "Morning Routine",
        type: "habit",
      }),
    });

    const response = await POST(request, {
      params: Promise.resolve({ accountId: "account_1" }),
    });

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      project: {
        id: "project_1",
        name: "Morning Routine",
        type: "habit",
      },
    });
  });

  it("maps service validation errors to HTTP responses", async () => {
    mockService.createProject.mockRejectedValue(
      new ProjectServiceError("Project type must be valid.", "INVALID_INPUT"),
    );

    const request = new Request("http://localhost/api/accounts/account_1/projects", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        name: "Morning Routine",
        type: "unknown",
      }),
    });

    const response = await POST(request, {
      params: Promise.resolve({ accountId: "account_1" }),
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Project type must be valid.",
    });
  });
});
