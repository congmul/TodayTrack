import { getCosmosClient } from "@/lib/db/cosmos";
import {
  CosmosProjectRepository,
  type ProjectRecord,
  type ProjectRepository,
} from "@/lib/db/project-repository";
import {
  CosmosUserRepository,
  type UserRepository,
} from "@/lib/db/user-repository";
import type { AuthUserDto } from "@/lib/services/auth-service";

export class WorkspaceServiceError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "USER_NOT_FOUND"
      | "PROJECT_NOT_FOUND"
      | "PROJECT_NOT_FOR_USER",
  ) {
    super(message);
    this.name = "WorkspaceServiceError";
  }
}

export type LandingDestination = {
  path: string;
  user: AuthUserDto;
};

export type WorkspaceContext = {
  hasProjects: boolean;
  projects: ProjectRecord[];
  selectedProject: ProjectRecord | null;
  user: AuthUserDto;
};

export class WorkspaceService {
  constructor(
    private readonly users: UserRepository,
    private readonly projects: ProjectRepository,
  ) {}

  async getWorkspaceContext(
    userId: string,
    requestedProjectId?: string | null,
  ): Promise<WorkspaceContext> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new WorkspaceServiceError("User not found.", "USER_NOT_FOUND");
    }

    const projects = await this.projects.listByUserId(user.id);
    if (projects.length === 0) {
      return {
        hasProjects: false,
        projects,
        selectedProject: null,
        user: toAuthUserDto(user),
      };
    }

    const selectedProject =
      projects.find((project) => project.id === requestedProjectId) ??
      projects.find((project) => project.id === user.selectedProjectId) ??
      projects[0];

    const resolvedUser =
      user.selectedProjectId === selectedProject.id
        ? user
        : await this.users.updateWorkspace(user, {
            selectedProjectId: selectedProject.id,
          });

    return {
      hasProjects: true,
      projects,
      selectedProject,
      user: toAuthUserDto(resolvedUser),
    };
  }

  async resolveLandingForUser(userId: string): Promise<LandingDestination> {
    const context = await this.getWorkspaceContext(userId);

    if (!context.hasProjects || !context.selectedProject) {
      return {
        path: "/projects",
        user: context.user,
      };
    }

    return {
      path: `/today?project=${context.selectedProject.id}`,
      user: context.user,
    };
  }

  async updateSelectedProject(userId: string, projectId: string) {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new WorkspaceServiceError("User not found.", "USER_NOT_FOUND");
    }

    const project = await this.projects.findById(projectId);
    if (!project) {
      throw new WorkspaceServiceError("Project not found.", "PROJECT_NOT_FOUND");
    }

    if (project.userId !== user.id) {
      throw new WorkspaceServiceError(
        "Project does not belong to the current user.",
        "PROJECT_NOT_FOR_USER",
      );
    }

    const updatedUser = await this.users.updateWorkspace(user, {
      selectedProjectId: project.id,
    });

    return toAuthUserDto(updatedUser);
  }
}

export function createWorkspaceService() {
  const client = getCosmosClient();

  return new WorkspaceService(
    new CosmosUserRepository(client),
    new CosmosProjectRepository(client),
  );
}

function toAuthUserDto(user: {
  id: string;
  provider: AuthUserDto["provider"];
  providerUserId: string;
  selectedProjectId: string | null;
  email: string | null;
  displayName: string;
  avatarUrl: string | null;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
}): AuthUserDto {
  return {
    id: user.id,
    provider: user.provider,
    providerUserId: user.providerUserId,
    selectedProjectId: user.selectedProjectId,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
