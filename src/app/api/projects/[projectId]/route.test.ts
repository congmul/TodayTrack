import { GET } from "@/app/api/projects/[projectId]/route";
import { ProjectServiceError } from "@/lib/services/project-service";

const mockService = {
  getProject: vi.fn(),
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

describe("projects/[projectId] route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a project detail payload", async () => {
    mockService.getProject.mockResolvedValue({
      id: "project_1",
      name: "Launch",
      type: "task",
    });

    const response = await GET(new Request("http://localhost/api/projects/project_1"), {
      params: Promise.resolve({ projectId: "project_1" }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      project: {
        id: "project_1",
        name: "Launch",
        type: "task",
      },
    });
  });

  it("maps missing projects to 404", async () => {
    mockService.getProject.mockRejectedValue(
      new ProjectServiceError("Project not found.", "PROJECT_NOT_FOUND"),
    );

    const response = await GET(new Request("http://localhost/api/projects/missing"), {
      params: Promise.resolve({ projectId: "missing" }),
    });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Project not found.",
    });
  });
});
