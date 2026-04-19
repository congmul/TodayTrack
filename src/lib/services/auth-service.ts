import { getCosmosClient } from "@/lib/db/cosmos";
import {
  CosmosProjectMemberRepository,
  type ProjectMemberRepository,
} from "@/lib/db/project-member-repository";
import {
  CosmosUserRepository,
  type UpsertUserRecordInput,
  type UserRepository,
} from "@/lib/db/user-repository";
import type { AuthProviderValue } from "@/lib/db/cosmos-schema";
import { isMissingCosmosResourceError } from "@/lib/db/cosmos-errors";

export type AuthUserDto = {
  id: string;
  provider: AuthProviderValue;
  providerUserId: string;
  selectedProjectId: string | null;
  email: string | null;
  displayName: string;
  avatarUrl: string | null;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
};

export type SyncAzureUserInput = {
  providerUserId: string;
  email?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
};

export type SyncOAuthUserInput = SyncAzureUserInput & {
  provider: AuthProviderValue;
};

export class AuthServiceError extends Error {
  constructor(
    message: string,
    public readonly code: "INVALID_INPUT",
  ) {
    super(message);
    this.name = "AuthServiceError";
  }
}

export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly projectMembers: ProjectMemberRepository,
  ) {}

  async syncOAuthUser(input: SyncOAuthUserInput) {
    const providerUserId = input.providerUserId?.trim();
    if (!providerUserId) {
      throw new AuthServiceError(
        "providerUserId is required.",
        "INVALID_INPUT",
      );
    }

    const displayName =
      input.displayName?.trim() || input.email?.trim() || "TodayTrack User";
    const normalizedInput: UpsertUserRecordInput = {
      provider: input.provider,
      providerUserId,
      email: normalizeNullableString(input.email),
      displayName,
      avatarUrl: normalizeNullableString(input.avatarUrl),
    };

    const existingUser = await this.users.findByProviderUserId(
      input.provider,
      providerUserId,
    );

    if (!existingUser) {
      const createdUser = await this.users.create(normalizedInput);
      await this.activatePendingInvites(createdUser.id, createdUser.email);
      return toAuthUserDto(createdUser);
    }

    const updatedUser = await this.users.update(existingUser, normalizedInput);
    await this.activatePendingInvites(updatedUser.id, updatedUser.email);
    return toAuthUserDto(updatedUser);
  }

  async syncAzureUser(input: SyncAzureUserInput) {
    return this.syncOAuthUser({
      provider: "microsoft",
      ...input,
    });
  }

  private async activatePendingInvites(userId: string, email: string | null) {
    if (!email) {
      return;
    }

    let pendingInvites;
    try {
      pendingInvites = await this.projectMembers.listPendingByEmail(email);
    } catch (error) {
      if (isMissingCosmosResourceError(error)) {
        return;
      }

      throw error;
    }

    await Promise.all(
      pendingInvites.map((invite) =>
        this.projectMembers.activateInvite(invite, userId),
      ),
    );
  }
}

export function createAuthService() {
  const client = getCosmosClient();

  return new AuthService(
    new CosmosUserRepository(client),
    new CosmosProjectMemberRepository(client),
  );
}

function normalizeNullableString(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function toAuthUserDto(user: Awaited<ReturnType<UserRepository["create"]>>) {
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
