import { getCosmosClient } from "@/lib/db/cosmos";
import {
  CosmosUserRepository,
  type UpsertUserRecordInput,
  type UserRepository,
} from "@/lib/db/user-repository";
import type { AuthProviderValue } from "@/lib/db/cosmos-schema";

export type AuthUserDto = {
  id: string;
  provider: AuthProviderValue;
  providerUserId: string;
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
  constructor(private readonly repository: UserRepository) {}

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

    const existingUser = await this.repository.findByProviderUserId(
      input.provider,
      providerUserId,
    );

    if (!existingUser) {
      const createdUser = await this.repository.create(normalizedInput);
      return toAuthUserDto(createdUser);
    }

    const updatedUser = await this.repository.update(existingUser, normalizedInput);
    return toAuthUserDto(updatedUser);
  }

  async syncAzureUser(input: SyncAzureUserInput) {
    return this.syncOAuthUser({
      provider: "microsoft",
      ...input,
    });
  }
}

export function createAuthService() {
  return new AuthService(new CosmosUserRepository(getCosmosClient()));
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
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
