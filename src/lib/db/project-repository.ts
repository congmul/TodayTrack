import {
  CosmosClient,
  type Container,
  type SqlQuerySpec,
} from "@azure/cosmos";
import {
  cosmosContainers,
  cosmosDatabaseId,
  type ProjectDocument,
  type ProjectTypeValue,
} from "@/lib/db/cosmos-schema";

export type ProjectRecord = ProjectDocument;

export type CreateProjectRecordInput = {
  ownerUserId: string;
  name: string;
  description?: string;
  type: ProjectTypeValue;
};

export type UpdateProjectRecordInput = {
  name?: string;
  description?: string | null;
  type?: ProjectTypeValue;
  status?: ProjectDocument["status"];
  alertEnabled?: boolean;
};

export interface ProjectRepository {
  findById(projectId: string): Promise<ProjectRecord | null>;
  findByName(ownerUserId: string, name: string): Promise<ProjectRecord | null>;
  listOwnedByUserId(ownerUserId: string): Promise<ProjectRecord[]>;
  create(input: CreateProjectRecordInput): Promise<ProjectRecord>;
  update(
    project: ProjectRecord,
    input: UpdateProjectRecordInput,
  ): Promise<ProjectRecord>;
  delete(project: ProjectRecord): Promise<void>;
}

export class CosmosProjectRepository implements ProjectRepository {
  private readonly projectsContainer: Container;

  constructor(private readonly client: CosmosClient) {
    const database = client.database(cosmosDatabaseId);
    this.projectsContainer = database.container(cosmosContainers.projects.id);
  }

  async findById(projectId: string) {
    const query: SqlQuerySpec = {
      query: "SELECT TOP 1 * FROM c WHERE c.id = @projectId AND c.kind = 'project'",
      parameters: [{ name: "@projectId", value: projectId }],
    };
    const { resources } = await this.projectsContainer.items
      .query<ProjectDocument>(query)
      .fetchAll();

    return resources[0] ?? null;
  }

  async findByName(ownerUserId: string, name: string) {
    const query: SqlQuerySpec = {
      query:
        "SELECT TOP 1 * FROM c WHERE c.ownerUserId = @ownerUserId AND c.kind = 'project' AND c.name = @name",
      parameters: [
        { name: "@ownerUserId", value: ownerUserId },
        { name: "@name", value: name },
      ],
    };
    const { resources } = await this.projectsContainer.items
      .query<ProjectDocument>(query, {
        partitionKey: ownerUserId,
      })
      .fetchAll();

    return resources[0] ?? null;
  }

  async listOwnedByUserId(ownerUserId: string) {
    const query: SqlQuerySpec = {
      query:
        "SELECT * FROM c WHERE c.ownerUserId = @ownerUserId AND c.kind = 'project' ORDER BY c.createdAt DESC",
      parameters: [{ name: "@ownerUserId", value: ownerUserId }],
    };
    const { resources } = await this.projectsContainer.items
      .query<ProjectDocument>(query, {
        partitionKey: ownerUserId,
      })
      .fetchAll();

    return resources;
  }

  async create(input: CreateProjectRecordInput) {
    const now = new Date().toISOString();
    const project: ProjectDocument = {
      id: crypto.randomUUID(),
      kind: "project",
      ownerUserId: input.ownerUserId,
      name: input.name,
      description: input.description ?? null,
      type: input.type,
      status: "active",
      alertEnabled: false,
      createdAt: now,
      updatedAt: now,
    };

    const { resource } = await this.projectsContainer.items.create(project);

    if (!resource) {
      throw new Error("Project creation returned no resource.");
    }

    return resource;
  }

  async update(project: ProjectRecord, input: UpdateProjectRecordInput) {
    const updatedProject: ProjectDocument = {
      ...project,
      ...input,
      updatedAt: new Date().toISOString(),
    };

    const { resource } = await this.projectsContainer
      .item(project.id, project.ownerUserId)
      .replace<ProjectDocument>(updatedProject);

    if (!resource) {
      throw new Error("Project update returned no resource.");
    }

    return resource;
  }

  async delete(project: ProjectRecord) {
    await this.projectsContainer.item(project.id, project.ownerUserId).delete();
  }
}
