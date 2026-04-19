import { getCosmosClient } from "@/lib/db/cosmos";
import {
  CosmosProjectMemberRepository,
  type ProjectMemberRecord,
  type ProjectMemberRepository,
} from "@/lib/db/project-member-repository";
import {
  CosmosProjectRepository,
  type ProjectRecord,
  type ProjectRepository,
} from "@/lib/db/project-repository";
import { CosmosTaskRepository, type TaskRepository } from "@/lib/db/task-repository";
import {
  CosmosUserRepository,
  type UserRepository,
} from "@/lib/db/user-repository";
import { isMissingCosmosResourceError } from "@/lib/db/cosmos-errors";
import {
  isProjectTypeValue,
  type ProjectAccessRoleValue,
  type ProjectDocument,
  type ProjectMemberDocument,
  type ProjectTypeValue,
} from "@/lib/db/cosmos-schema";

export type ProjectInvitationDto = {
  id: string;
  invitedEmail: string;
  status: ProjectMemberDocument["status"];
  role: ProjectMemberDocument["role"];
  userId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProjectDto = {
  id: string;
  ownerUserId: string;
  name: string;
  description: string | null;
  type: ProjectTypeValue;
  status: "active" | "archived";
  alertEnabled: boolean;
  taskCount: number;
  accessRole: ProjectAccessRoleValue;
  isSelected: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProjectDetailDto = ProjectDto & {
  invitations: ProjectInvitationDto[];
};

export type CreateProjectInput = {
  name: string;
  description?: string;
  type: string;
};

export type UpdateProjectInput = {
  name?: string;
  description?: string | null;
  type?: string;
  status?: string;
  alertEnabled?: boolean;
};

export type InviteProjectMemberInput = {
  email: string;
};

type ProjectAccessContext = {
  project: ProjectRecord;
  role: ProjectAccessRoleValue;
};

export class ProjectServiceError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "INVALID_INPUT"
      | "PROJECT_NOT_FOUND"
      | "PROJECT_NAME_CONFLICT"
      | "PROJECT_ACCESS_DENIED"
      | "PROJECT_DELETE_FORBIDDEN"
      | "PROJECT_INVITE_CONFLICT"
      | "PROJECT_MEMBER_NOT_FOUND",
  ) {
    super(message);
    this.name = "ProjectServiceError";
  }
}

export class ProjectService {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly projectMembers: ProjectMemberRepository,
    private readonly tasks: TaskRepository,
    private readonly users: UserRepository,
  ) {}

  async listProjects(userId: string, selectedProjectId?: string | null) {
    assertId(userId, "userId");

    const visibleProjects = await this.listVisibleProjects(userId);
    const projectDtos = await Promise.all(
      visibleProjects.map(async ({ project, role }) =>
        this.toProjectDto(project, role, selectedProjectId ?? null),
      ),
    );

    return projectDtos;
  }

  async getProject(
    projectId: string,
    userId: string,
    selectedProjectId?: string | null,
  ) {
    assertId(projectId, "projectId");
    assertId(userId, "userId");

    const access = await this.getProjectAccess(projectId, userId);
    if (!access) {
      throw new ProjectServiceError("Project not found.", "PROJECT_NOT_FOUND");
    }

    const [project, invitations] = await Promise.all([
      this.toProjectDto(access.project, access.role, selectedProjectId ?? null),
      this.listProjectInvitations(projectId),
    ]);

    return {
      ...project,
      invitations: invitations.map(toProjectInvitationDto),
    } satisfies ProjectDetailDto;
  }

  async createProject(userId: string, input: CreateProjectInput) {
    assertId(userId, "userId");

    const normalizedName = input.name?.trim();
    if (!normalizedName) {
      throw new ProjectServiceError(
        "Project name is required.",
        "INVALID_INPUT",
      );
    }

    const type = parseProjectType(input.type);
    const description = normalizeDescription(input.description);

    const existingProject = await this.projects.findByName(userId, normalizedName);
    if (existingProject) {
      throw new ProjectServiceError(
        "A project with this name already exists for this user.",
        "PROJECT_NAME_CONFLICT",
      );
    }

    const project = await this.projects.create({
      ownerUserId: userId,
      name: normalizedName,
      description,
      type,
    });

    return this.toProjectDto(project, "owner", null);
  }

  async updateProject(projectId: string, userId: string, input: UpdateProjectInput) {
    assertId(projectId, "projectId");
    assertId(userId, "userId");

    const access = await this.getProjectAccess(projectId, userId);
    if (!access) {
      throw new ProjectServiceError("Project not found.", "PROJECT_NOT_FOUND");
    }

    const updates: Parameters<ProjectRepository["update"]>[1] = {};

    if (input.name !== undefined) {
      const normalizedName = input.name.trim();
      if (!normalizedName) {
        throw new ProjectServiceError(
          "Project name cannot be empty.",
          "INVALID_INPUT",
        );
      }

      if (normalizedName !== access.project.name) {
        const existingProject = await this.projects.findByName(
          access.project.ownerUserId,
          normalizedName,
        );

        if (existingProject && existingProject.id !== access.project.id) {
          throw new ProjectServiceError(
            "A project with this name already exists for this user.",
            "PROJECT_NAME_CONFLICT",
          );
        }
      }

      updates.name = normalizedName;
    }

    if (input.description !== undefined) {
      updates.description = normalizeNullableDescription(input.description);
    }

    if (input.type !== undefined) {
      updates.type = parseProjectType(input.type);
    }

    if (input.status !== undefined) {
      updates.status = parseProjectStatus(input.status);
    }

    if (input.alertEnabled !== undefined) {
      if (typeof input.alertEnabled !== "boolean") {
        throw new ProjectServiceError(
          "alertEnabled must be a boolean.",
          "INVALID_INPUT",
        );
      }

      updates.alertEnabled = input.alertEnabled;
    }

    if (Object.keys(updates).length === 0) {
      throw new ProjectServiceError(
        "At least one updatable field is required.",
        "INVALID_INPUT",
      );
    }

    const updatedProject = await this.projects.update(access.project, updates);
    return this.toProjectDto(updatedProject, access.role, null);
  }

  async deleteProject(projectId: string, userId: string) {
    assertId(projectId, "projectId");
    assertId(userId, "userId");

    const access = await this.getProjectAccess(projectId, userId);
    if (!access) {
      throw new ProjectServiceError("Project not found.", "PROJECT_NOT_FOUND");
    }

    if (access.role !== "owner") {
      throw new ProjectServiceError(
        "Only the project owner can delete this project.",
        "PROJECT_DELETE_FORBIDDEN",
      );
    }

    await Promise.all([
      this.tasks.deleteByProjectId(access.project.id),
      this.projectMembers.deleteByProjectId(access.project.id),
      this.projects.delete(access.project),
    ]);
  }

  async inviteMember(
    projectId: string,
    invitedByUserId: string,
    input: InviteProjectMemberInput,
  ) {
    const access = await this.getProjectAccess(projectId, invitedByUserId);
    if (!access) {
      throw new ProjectServiceError("Project not found.", "PROJECT_NOT_FOUND");
    }

    const invitedEmail = normalizeEmail(input.email);
    if (!invitedEmail) {
      throw new ProjectServiceError(
        "Invite email is required.",
        "INVALID_INPUT",
      );
    }

    const existingUser = await this.users.findByEmail(invitedEmail);
    if (existingUser?.id === access.project.ownerUserId) {
      throw new ProjectServiceError(
        "This user already owns the project.",
        "PROJECT_INVITE_CONFLICT",
      );
    }

    if (existingUser) {
      const existingMember = await this.projectMembers.findActive(
        projectId,
        existingUser.id,
      );
      if (existingMember) {
        throw new ProjectServiceError(
          "This user already has access to the project.",
          "PROJECT_INVITE_CONFLICT",
        );
      }
    }

    const existingPendingInvite = await this.projectMembers.findPending(
      projectId,
      invitedEmail,
    );
    if (existingPendingInvite) {
      throw new ProjectServiceError(
        "This email has already been invited to the project.",
        "PROJECT_INVITE_CONFLICT",
      );
    }

    const pendingInvite = await this.projectMembers.createPendingInvite({
      projectId,
      invitedEmail,
      invitedByUserId,
    });

    const invitation = existingUser
      ? await this.projectMembers.activateInvite(pendingInvite, existingUser.id)
      : pendingInvite;

    return toProjectInvitationDto(invitation);
  }

  async removeMember(projectId: string, actorUserId: string, memberId: string) {
    assertId(projectId, "projectId");
    assertId(actorUserId, "actorUserId");
    assertId(memberId, "memberId");

    const access = await this.getProjectAccess(projectId, actorUserId);
    if (!access) {
      throw new ProjectServiceError("Project not found.", "PROJECT_NOT_FOUND");
    }

    if (access.role !== "owner") {
      throw new ProjectServiceError(
        "Only the project owner can remove collaborators.",
        "PROJECT_DELETE_FORBIDDEN",
      );
    }

    const member = await this.projectMembers.findById(projectId, memberId);
    if (!member) {
      throw new ProjectServiceError(
        "Collaborator not found.",
        "PROJECT_MEMBER_NOT_FOUND",
      );
    }

    await this.projectMembers.delete(member);
  }

  private async listVisibleProjects(userId: string) {
    const ownedProjects = await this.projects.listOwnedByUserId(userId);
    let memberEntries: Awaited<
      ReturnType<ProjectMemberRepository["listActiveByUserId"]>
    > = [];

    try {
      memberEntries = await this.projectMembers.listActiveByUserId(userId);
    } catch (error) {
      if (!isMissingCosmosResourceError(error)) {
        throw error;
      }
    }

    const visibleProjects = new Map<
      string,
      { project: ProjectRecord; role: ProjectAccessRoleValue }
    >();

    for (const project of ownedProjects) {
      visibleProjects.set(project.id, { project, role: "owner" });
    }

    await Promise.all(
      memberEntries.map(async (member) => {
        if (visibleProjects.has(member.projectId)) {
          return;
        }

        const project = await this.projects.findById(member.projectId);
        if (!project) {
          return;
        }

        visibleProjects.set(project.id, { project, role: member.role });
      }),
    );

    return Array.from(visibleProjects.values()).sort((left, right) =>
      right.project.createdAt.localeCompare(left.project.createdAt),
    );
  }

  private async getProjectAccess(projectId: string, userId: string) {
    const project = await this.projects.findById(projectId);
    if (!project) {
      return null;
    }

    if (project.ownerUserId === userId) {
      return {
        project,
        role: "owner",
      } satisfies ProjectAccessContext;
    }

    let member = null;

    try {
      member = await this.projectMembers.findActive(projectId, userId);
    } catch (error) {
      if (!isMissingCosmosResourceError(error)) {
        throw error;
      }
    }

    if (!member) {
      return null;
    }

    return {
      project,
      role: member.role,
    } satisfies ProjectAccessContext;
  }

  private async toProjectDto(
    project: ProjectRecord,
    accessRole: ProjectAccessRoleValue,
    selectedProjectId: string | null,
  ) {
    const taskCount = await this.countProjectTasks(project.id);

    return {
      id: project.id,
      ownerUserId: project.ownerUserId,
      name: project.name,
      description: project.description,
      type: project.type,
      status: project.status,
      alertEnabled: project.alertEnabled,
      taskCount,
      accessRole,
      isSelected: selectedProjectId === project.id,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    } satisfies ProjectDto;
  }

  private async countProjectTasks(projectId: string) {
    try {
      return await this.tasks.countByProjectId(projectId);
    } catch (error) {
      if (isMissingCosmosResourceError(error)) {
        return 0;
      }

      throw error;
    }
  }

  private async listProjectInvitations(projectId: string) {
    try {
      return await this.projectMembers.listByProjectId(projectId);
    } catch (error) {
      if (isMissingCosmosResourceError(error)) {
        return [];
      }

      throw error;
    }
  }
}

export function createProjectService() {
  const client = getCosmosClient();

  return new ProjectService(
    new CosmosProjectRepository(client),
    new CosmosProjectMemberRepository(client),
    new CosmosTaskRepository(client),
    new CosmosUserRepository(client),
  );
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

function normalizeNullableDescription(description?: string | null) {
  if (description === null) {
    return null;
  }

  const value = description?.trim();
  return value ? value : null;
}

function parseProjectStatus(value: string): ProjectDocument["status"] {
  const normalized = value?.trim().toLowerCase();

  if (normalized === "active" || normalized === "archived") {
    return normalized;
  }

  throw new ProjectServiceError(
    'Project status must be "active" or "archived".',
    "INVALID_INPUT",
  );
}

function assertId(value: string, fieldName: string) {
  if (!value?.trim()) {
    throw new ProjectServiceError(
      `${fieldName} is required.`,
      "INVALID_INPUT",
    );
  }
}

function normalizeEmail(email?: string | null) {
  return email?.trim().toLowerCase() ?? "";
}

function toProjectInvitationDto(member: ProjectMemberRecord): ProjectInvitationDto {
  return {
    id: member.id,
    invitedEmail: member.invitedEmail,
    status: member.status,
    role: member.role,
    userId: member.userId,
    createdAt: member.createdAt,
    updatedAt: member.updatedAt,
  };
}
