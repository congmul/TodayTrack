import {
  CosmosClient,
  type Container,
} from "@azure/cosmos";
import {
  cosmosContainers,
  cosmosDatabaseId,
  type AuthProviderValue,
  type UserDocument,
} from "@/lib/db/cosmos-schema";

export type UserRecord = UserDocument;

export type UpsertUserRecordInput = {
  provider: AuthProviderValue;
  providerUserId: string;
  email: string | null;
  displayName: string;
  avatarUrl: string | null;
};

export type UpdateUserWorkspaceInput = {
  selectedProjectId: string | null;
};

export interface UserRepository {
  findById(userId: string): Promise<UserRecord | null>;
  findByProviderUserId(
    provider: AuthProviderValue,
    providerUserId: string,
  ): Promise<UserRecord | null>;
  create(input: UpsertUserRecordInput): Promise<UserRecord>;
  update(user: UserRecord, input: UpsertUserRecordInput): Promise<UserRecord>;
  updateWorkspace(
    user: UserRecord,
    input: UpdateUserWorkspaceInput,
  ): Promise<UserRecord>;
}

export class CosmosUserRepository implements UserRepository {
  private readonly usersContainer: Container;

  constructor(private readonly client: CosmosClient) {
    const database = client.database(cosmosDatabaseId);
    this.usersContainer = database.container(cosmosContainers.users.id);
  }

  async findById(userId: string) {
    const response = await this.usersContainer
      .item(userId, userId)
      .read<UserDocument>()
      .catch((error: { code?: number }) => {
        if (error?.code === 404) {
          return null;
        }

        throw error;
      });

    if (!response || !response.resource) {
      return null;
    }

    return response.resource;
  }

  async findByProviderUserId(
    provider: AuthProviderValue,
    providerUserId: string,
  ) {
    const id = buildUserDocumentId(provider, providerUserId);
    const response = await this.usersContainer
      .item(id, id)
      .read<UserDocument>()
      .catch((error: { code?: number }) => {
        if (error?.code === 404) {
          return null;
        }

        throw error;
      });

    if (!response) {
      return null;
    }

    if (!response.resource) {
      return null;
    }

    return response.resource;
  }

  async create(input: UpsertUserRecordInput) {
    const now = new Date().toISOString();
    const user: UserDocument = {
      id: buildUserDocumentId(input.provider, input.providerUserId),
      kind: "user",
      provider: input.provider,
      providerUserId: input.providerUserId,
      selectedProjectId: null,
      email: input.email,
      displayName: input.displayName,
      avatarUrl: input.avatarUrl,
      lastLoginAt: now,
      createdAt: now,
      updatedAt: now,
    };

    const { resource } = await this.usersContainer.items.create(user);

    if (!resource) {
      throw new Error("User creation returned no resource.");
    }

    return resource;
  }

  async update(user: UserRecord, input: UpsertUserRecordInput) {
    const updatedUser: UserDocument = {
      ...user,
      email: input.email,
      displayName: input.displayName,
      avatarUrl: input.avatarUrl,
      lastLoginAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { resource } = await this.usersContainer
      .item(user.id, user.id)
      .replace<UserDocument>(updatedUser);

    if (!resource) {
      throw new Error("User update returned no resource.");
    }

    return resource;
  }

  async updateWorkspace(user: UserRecord, input: UpdateUserWorkspaceInput) {
    const updatedUser: UserDocument = {
      ...user,
      selectedProjectId: input.selectedProjectId,
      updatedAt: new Date().toISOString(),
    };

    const { resource } = await this.usersContainer
      .item(user.id, user.id)
      .replace<UserDocument>(updatedUser);

    if (!resource) {
      throw new Error("User workspace update returned no resource.");
    }

    return resource;
  }
}

export function buildUserDocumentId(
  provider: AuthProviderValue,
  providerUserId: string,
) {
  return `${provider}:${providerUserId}`;
}
