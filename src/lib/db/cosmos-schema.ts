export const cosmosDatabaseId =
  process.env.COSMOSDB_DATABASE ?? "todaytrack";

export const cosmosContainers = {
  accounts: {
    id: "accounts",
    partitionKey: "/id",
  },
  users: {
    id: "users",
    partitionKey: "/id",
  },
  projects: {
    id: "projects",
    partitionKey: "/accountId",
  },
} as const;

export type ProjectTypeValue = "habit" | "task";
export type ProjectStatusValue = "active" | "archived";
export type AuthProviderValue = "microsoft" | "google";

export type AccountDocument = {
  id: string;
  kind: "account";
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type UserDocument = {
  id: string;
  kind: "user";
  provider: AuthProviderValue;
  providerUserId: string;
  email: string | null;
  displayName: string;
  avatarUrl: string | null;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
};

export type ProjectDocument = {
  id: string;
  kind: "project";
  accountId: string;
  name: string;
  description: string | null;
  type: ProjectTypeValue;
  status: ProjectStatusValue;
  alertEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export function isProjectTypeValue(value: string): value is ProjectTypeValue {
  return value === "habit" || value === "task";
}
