import {
  CosmosProjectRepository,
  type ProjectRepository,
} from "@/lib/db/project-repository";
import { getCosmosClient } from "@/lib/db/cosmos";
import {
  isProjectTypeValue,
  type ProjectDocument,
  type ProjectTypeValue,
} from "@/lib/db/cosmos-schema";

export type ProjectDto = {
  id: string;
  accountId: string;
  name: string;
  description: string | null;
  type: ProjectTypeValue;
  status: "active" | "archived";
  alertEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateProjectInput = {
  accountId: string;
  name: string;
  description?: string;
  type: string;
};

export class ProjectServiceError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "INVALID_INPUT"
      | "ACCOUNT_NOT_FOUND"
      | "PROJECT_NOT_FOUND"
      | "PROJECT_NAME_CONFLICT",
  ) {
    super(message);
    this.name = "ProjectServiceError";
  }
}

export class ProjectService {
  constructor(private readonly repository: ProjectRepository) {}

  async listProjects(accountId: string) {
    assertId(accountId, "accountId");

    const exists = await this.repository.accountExists(accountId);
    if (!exists) {
      throw new ProjectServiceError("Account not found.", "ACCOUNT_NOT_FOUND");
    }

    const projects = await this.repository.listByAccountId(accountId);
    return projects.map(toProjectDto);
  }

  async getProject(projectId: string) {
    assertId(projectId, "projectId");

    const project = await this.repository.findById(projectId);
    if (!project) {
      throw new ProjectServiceError("Project not found.", "PROJECT_NOT_FOUND");
    }

    return toProjectDto(project);
  }

  async createProject(input: CreateProjectInput) {
    assertId(input.accountId, "accountId");

    const normalizedName = input.name?.trim();
    if (!normalizedName) {
      throw new ProjectServiceError(
        "Project name is required.",
        "INVALID_INPUT",
      );
    }

    const type = parseProjectType(input.type);
    const description = normalizeDescription(input.description);
    const exists = await this.repository.accountExists(input.accountId);

    if (!exists) {
      throw new ProjectServiceError("Account not found.", "ACCOUNT_NOT_FOUND");
    }

    const existingProject = await this.repository.findByName(
      input.accountId,
      normalizedName,
    );

    if (existingProject) {
      throw new ProjectServiceError(
        "A project with this name already exists in the account.",
        "PROJECT_NAME_CONFLICT",
      );
    }

    const project = await this.repository.create({
      accountId: input.accountId,
      name: normalizedName,
      description,
      type,
    });

    return toProjectDto(project);
  }
}

export function createProjectService() {
  return new ProjectService(new CosmosProjectRepository(getCosmosClient()));
}

function parseProjectType(value: string): ProjectTypeValue {
  const normalized = value?.trim().toLowerCase();

  if (isProjectTypeValue(normalized)) {
    return normalized;
  }

  throw new ProjectServiceError(
    'Project type must be "habit" or "task".',
    "INVALID_INPUT",
  );
}

function normalizeDescription(description?: string) {
  const value = description?.trim();
  return value ? value : undefined;
}

function assertId(value: string, fieldName: string) {
  if (!value?.trim()) {
    throw new ProjectServiceError(
      `${fieldName} is required.`,
      "INVALID_INPUT",
    );
  }
}

function toProjectDto(project: ProjectDocument): ProjectDto {
  return {
    id: project.id,
    accountId: project.accountId,
    name: project.name,
    description: project.description,
    type: project.type,
    status: project.status,
    alertEnabled: project.alertEnabled,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}
