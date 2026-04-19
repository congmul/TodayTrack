export const cosmosDatabaseId =
  process.env.COSMOSDB_DATABASE ?? "todaytrack";

export const cosmosContainers = {
  users: {
    id: "users",
    partitionKey: "/id",
  },
  projects: {
    id: "projects",
    partitionKey: "/userId",
  },
} as const;

export type ProjectTypeValue = "habit" | "task";
export type ProjectStatusValue = "active" | "archived";
export type AuthProviderValue = "microsoft" | "google";

export type UserDocument = {
  id: string;
  kind: "user";
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

export type ProjectDocument = {
  id: string;
  kind: "project";
  userId: string;
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
