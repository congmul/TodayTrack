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
  accountId: string;
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
  accountExists(accountId: string): Promise<boolean>;
  findById(projectId: string): Promise<ProjectRecord | null>;
  findByName(accountId: string, name: string): Promise<ProjectRecord | null>;
  listByAccountId(accountId: string): Promise<ProjectRecord[]>;
  create(input: CreateProjectRecordInput): Promise<ProjectRecord>;
  update(
    project: ProjectRecord,
    input: UpdateProjectRecordInput,
  ): Promise<ProjectRecord>;
  delete(project: ProjectRecord): Promise<void>;
}

export class CosmosProjectRepository implements ProjectRepository {
  private readonly accountsContainer: Container;
  private readonly projectsContainer: Container;

  constructor(private readonly client: CosmosClient) {
    const database = client.database(cosmosDatabaseId);
    this.accountsContainer = database.container(cosmosContainers.accounts.id);
    this.projectsContainer = database.container(cosmosContainers.projects.id);
  }

  async accountExists(accountId: string) {
    const query: SqlQuerySpec = {
      query: "SELECT TOP 1 VALUE c.id FROM c WHERE c.id = @accountId AND c.kind = 'account'",
      parameters: [{ name: "@accountId", value: accountId }],
    };
    const { resources } = await this.accountsContainer.items
      .query<string>(query, {
        partitionKey: accountId,
      })
      .fetchAll();

    return resources.length > 0;
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

  async findByName(accountId: string, name: string) {
    const query: SqlQuerySpec = {
      query:
        "SELECT TOP 1 * FROM c WHERE c.accountId = @accountId AND c.kind = 'project' AND c.name = @name",
      parameters: [
        { name: "@accountId", value: accountId },
        { name: "@name", value: name },
      ],
    };
    const { resources } = await this.projectsContainer.items
      .query<ProjectDocument>(query, {
        partitionKey: accountId,
      })
      .fetchAll();

    return resources[0] ?? null;
  }

  async listByAccountId(accountId: string) {
    const query: SqlQuerySpec = {
      query:
        "SELECT * FROM c WHERE c.accountId = @accountId AND c.kind = 'project' ORDER BY c.createdAt DESC",
      parameters: [{ name: "@accountId", value: accountId }],
    };
    const { resources } = await this.projectsContainer.items
      .query<ProjectDocument>(query, {
        partitionKey: accountId,
      })
      .fetchAll();

    return resources;
  }

  async create(input: CreateProjectRecordInput) {
    const now = new Date().toISOString();
    const project: ProjectDocument = {
      id: crypto.randomUUID(),
      kind: "project",
      accountId: input.accountId,
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
      .item(project.id, project.accountId)
      .replace<ProjectDocument>(updatedProject);

    if (!resource) {
      throw new Error("Project update returned no resource.");
    }

    return resource;
  }

  async delete(project: ProjectRecord) {
    await this.projectsContainer.item(project.id, project.accountId).delete();
  }
}
