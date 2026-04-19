import {
  CosmosClient,
  type Container,
  type SqlQuerySpec,
} from "@azure/cosmos";
import {
  cosmosContainers,
  cosmosDatabaseId,
  type TaskDocument,
} from "@/lib/db/cosmos-schema";

export type TaskRecord = TaskDocument;

export interface TaskRepository {
  countByProjectId(projectId: string): Promise<number>;
  deleteByProjectId(projectId: string): Promise<void>;
}

export class CosmosTaskRepository implements TaskRepository {
  private readonly tasksContainer: Container;

  constructor(private readonly client: CosmosClient) {
    const database = client.database(cosmosDatabaseId);
    this.tasksContainer = database.container(cosmosContainers.tasks.id);
  }

  async countByProjectId(projectId: string) {
    const query: SqlQuerySpec = {
      query:
        "SELECT VALUE COUNT(1) FROM c WHERE c.projectId = @projectId AND c.kind = 'task'",
      parameters: [{ name: "@projectId", value: projectId }],
    };
    const { resources } = await this.tasksContainer.items
      .query<number>(query, {
        partitionKey: projectId,
      })
      .fetchAll();

    return resources[0] ?? 0;
  }

  async deleteByProjectId(projectId: string) {
    const query: SqlQuerySpec = {
      query: "SELECT c.id FROM c WHERE c.projectId = @projectId AND c.kind = 'task'",
      parameters: [{ name: "@projectId", value: projectId }],
    };
    const { resources } = await this.tasksContainer.items
      .query<{ id: string }>(query, {
        partitionKey: projectId,
      })
      .fetchAll();

    await Promise.all(
      resources.map((task) => this.tasksContainer.item(task.id, projectId).delete()),
    );
  }
}
