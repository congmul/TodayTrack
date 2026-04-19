import {
  CosmosClient,
  type Container,
  type SqlQuerySpec,
} from "@azure/cosmos";
import {
  cosmosContainers,
  cosmosDatabaseId,
  type ProjectMemberDocument,
} from "@/lib/db/cosmos-schema";

export type ProjectMemberRecord = ProjectMemberDocument;

export type CreateProjectInviteInput = {
  projectId: string;
  invitedEmail: string;
  invitedByUserId: string;
};

export interface ProjectMemberRepository {
  listByProjectId(projectId: string): Promise<ProjectMemberRecord[]>;
  listActiveByUserId(userId: string): Promise<ProjectMemberRecord[]>;
  listPendingByEmail(email: string): Promise<ProjectMemberRecord[]>;
  findActive(projectId: string, userId: string): Promise<ProjectMemberRecord | null>;
  findPending(projectId: string, invitedEmail: string): Promise<ProjectMemberRecord | null>;
  findById(projectId: string, memberId: string): Promise<ProjectMemberRecord | null>;
  createPendingInvite(input: CreateProjectInviteInput): Promise<ProjectMemberRecord>;
  activateInvite(
    member: ProjectMemberRecord,
    userId: string,
  ): Promise<ProjectMemberRecord>;
  delete(member: ProjectMemberRecord): Promise<void>;
  deleteByProjectId(projectId: string): Promise<void>;
}

export class CosmosProjectMemberRepository implements ProjectMemberRepository {
  private readonly membersContainer: Container;

  constructor(private readonly client: CosmosClient) {
    const database = client.database(cosmosDatabaseId);
    this.membersContainer = database.container(cosmosContainers.projectMembers.id);
  }

  async listByProjectId(projectId: string) {
    const query: SqlQuerySpec = {
      query:
        "SELECT * FROM c WHERE c.projectId = @projectId AND c.kind = 'project-member' ORDER BY c.createdAt DESC",
      parameters: [{ name: "@projectId", value: projectId }],
    };
    const { resources } = await this.membersContainer.items
      .query<ProjectMemberDocument>(query, {
        partitionKey: projectId,
      })
      .fetchAll();

    return resources;
  }

  async listActiveByUserId(userId: string) {
    const query: SqlQuerySpec = {
      query:
        "SELECT * FROM c WHERE c.userId = @userId AND c.status = 'active' AND c.kind = 'project-member'",
      parameters: [{ name: "@userId", value: userId }],
    };
    const { resources } = await this.membersContainer.items
      .query<ProjectMemberDocument>(query)
      .fetchAll();

    return resources;
  }

  async listPendingByEmail(email: string) {
    const query: SqlQuerySpec = {
      query:
        "SELECT * FROM c WHERE c.invitedEmail = @email AND c.status = 'pending' AND c.kind = 'project-member'",
      parameters: [{ name: "@email", value: email }],
    };
    const { resources } = await this.membersContainer.items
      .query<ProjectMemberDocument>(query)
      .fetchAll();

    return resources;
  }

  async findActive(projectId: string, userId: string) {
    const query: SqlQuerySpec = {
      query:
        "SELECT TOP 1 * FROM c WHERE c.projectId = @projectId AND c.userId = @userId AND c.status = 'active' AND c.kind = 'project-member'",
      parameters: [
        { name: "@projectId", value: projectId },
        { name: "@userId", value: userId },
      ],
    };
    const { resources } = await this.membersContainer.items
      .query<ProjectMemberDocument>(query, {
        partitionKey: projectId,
      })
      .fetchAll();

    return resources[0] ?? null;
  }

  async findPending(projectId: string, invitedEmail: string) {
    const query: SqlQuerySpec = {
      query:
        "SELECT TOP 1 * FROM c WHERE c.projectId = @projectId AND c.invitedEmail = @email AND c.status = 'pending' AND c.kind = 'project-member'",
      parameters: [
        { name: "@projectId", value: projectId },
        { name: "@email", value: invitedEmail },
      ],
    };
    const { resources } = await this.membersContainer.items
      .query<ProjectMemberDocument>(query, {
        partitionKey: projectId,
      })
      .fetchAll();

    return resources[0] ?? null;
  }

  async findById(projectId: string, memberId: string) {
    const response = await this.membersContainer
      .item(memberId, projectId)
      .read<ProjectMemberDocument>()
      .catch((error: { code?: number }) => {
        if (error?.code === 404) {
          return null;
        }

        throw error;
      });

    if (!response?.resource) {
      return null;
    }

    return response.resource;
  }

  async createPendingInvite(input: CreateProjectInviteInput) {
    const now = new Date().toISOString();
    const member: ProjectMemberDocument = {
      id: crypto.randomUUID(),
      kind: "project-member",
      projectId: input.projectId,
      userId: null,
      invitedEmail: input.invitedEmail,
      role: "manager",
      status: "pending",
      invitedByUserId: input.invitedByUserId,
      createdAt: now,
      updatedAt: now,
    };

    const { resource } = await this.membersContainer.items.create(member);

    if (!resource) {
      throw new Error("Project invite creation returned no resource.");
    }

    return resource;
  }

  async activateInvite(member: ProjectMemberRecord, userId: string) {
    const updatedMember: ProjectMemberDocument = {
      ...member,
      userId,
      status: "active",
      updatedAt: new Date().toISOString(),
    };

    const { resource } = await this.membersContainer
      .item(member.id, member.projectId)
      .replace<ProjectMemberDocument>(updatedMember);

    if (!resource) {
      throw new Error("Project invite activation returned no resource.");
    }

    return resource;
  }

  async delete(member: ProjectMemberRecord) {
    await this.membersContainer.item(member.id, member.projectId).delete();
  }

  async deleteByProjectId(projectId: string) {
    const members = await this.listByProjectId(projectId);
    await Promise.all(
      members.map((member) => this.delete(member)),
    );
  }
}
