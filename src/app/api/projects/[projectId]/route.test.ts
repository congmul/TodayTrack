import {
  DELETE,
  GET,
  PATCH,
} from "@/app/api/projects/[projectId]/route";
import { ProjectServiceError } from "@/lib/services/project-service";

const mockService = {
  getProject: vi.fn(),
  updateProject: vi.fn(),
  deleteProject: vi.fn(),
};
const mockGetApiSessionUser = vi.fn();

vi.mock("@/lib/services/project-service", async () => {
  const actual = await vi.importActual<typeof import("@/lib/services/project-service")>(
    "@/lib/services/project-service",
  );

  return {
    ...actual,
    createProjectService: () => mockService,
  };
});

vi.mock("@/lib/auth/api-user", () => ({
  getApiSessionUser: (...args: unknown[]) => mockGetApiSessionUser(...args),
}));

describe("projects/[projectId] route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetApiSessionUser.mockResolvedValue({ id: "microsoft:user-123" });
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
    expect(mockService.getProject).toHaveBeenCalledWith(
      "project_1",
      "microsoft:user-123",
    );
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

  it("updates a project through patch", async () => {
    mockService.updateProject.mockResolvedValue({
      id: "project_1",
      name: "Updated Launch",
      type: "task",
      status: "archived",
    });

    const response = await PATCH(
      new Request("http://localhost/api/projects/project_1", {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name: "Updated Launch",
          status: "archived",
        }),
      }),
      {
        params: Promise.resolve({ projectId: "project_1" }),
      },
    );

    expect(response.status).toBe(200);
    expect(mockService.updateProject).toHaveBeenCalledWith(
      "project_1",
      "microsoft:user-123",
      expect.objectContaining({
        name: "Updated Launch",
        status: "archived",
      }),
    );
    await expect(response.json()).resolves.toEqual({
      project: {
        id: "project_1",
        name: "Updated Launch",
        type: "task",
        status: "archived",
      },
    });
  });

  it("deletes a project through delete", async () => {
    mockService.deleteProject.mockResolvedValue(undefined);

    const response = await DELETE(
      new Request("http://localhost/api/projects/project_1", {
        method: "DELETE",
      }),
      {
        params: Promise.resolve({ projectId: "project_1" }),
      },
    );

    expect(response.status).toBe(204);
    expect(mockService.deleteProject).toHaveBeenCalledWith(
      "project_1",
      "microsoft:user-123",
    );
  });
});
