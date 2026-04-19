export const cosmosDatabaseId =
  process.env.COSMOSDB_DATABASE ?? "todaytrack";

export const cosmosContainers = {
  users: {
    id: "users",
    partitionKey: "/id",
  },
  projects: {
    id: "projects",
    partitionKey: "/ownerUserId",
  },
  projectMembers: {
    id: "projectMembers",
    partitionKey: "/projectId",
  },
  tasks: {
    id: "tasks",
    partitionKey: "/projectId",
  },
} as const;

export type ProjectTypeValue = "habit" | "task";
export type ProjectStatusValue = "active" | "archived";
export type AuthProviderValue = "microsoft" | "google";
export type ProjectAccessRoleValue = "owner" | "manager";
export type ProjectMemberStatusValue = "pending" | "active";

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
  ownerUserId: string;
  name: string;
  description: string | null;
  type: ProjectTypeValue;
  status: ProjectStatusValue;
  alertEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProjectMemberDocument = {
  id: string;
  kind: "project-member";
  projectId: string;
  userId: string | null;
  invitedEmail: string;
  role: Extract<ProjectAccessRoleValue, "manager">;
  status: ProjectMemberStatusValue;
  invitedByUserId: string;
  createdAt: string;
  updatedAt: string;
};

export type TaskDocument = {
  id: string;
  kind: "task";
  projectId: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  repeatRule: string | null;
  createdAt: string;
  updatedAt: string;
};

export function isProjectTypeValue(value: string): value is ProjectTypeValue {
  return value === "habit" || value === "task";
}
