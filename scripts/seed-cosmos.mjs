import fs from "node:fs";
import path from "node:path";
import { CosmosClient } from "@azure/cosmos";

const cwd = process.cwd();

loadEnvFile(path.join(cwd, ".env"));
loadEnvFile(path.join(cwd, ".env.local"));

const endpoint = process.env.COSMOSDB_ENDPOINT;
const key = process.env.COSMOSDB_KEY;
const databaseId = process.env.COSMOSDB_DATABASE ?? "todaytrack";

if (!endpoint || !key) {
  console.error("COSMOSDB_ENDPOINT and COSMOSDB_KEY must be set.");
  process.exit(1);
}

const client = new CosmosClient({
  endpoint,
  key,
  userAgentSuffix: "TodayTrackSeed",
});

const { database } = await client.databases.createIfNotExists({
  id: databaseId,
});

const { container: usersContainer } = await database.containers.createIfNotExists({
  id: "users",
  partitionKey: {
    paths: ["/id"],
  },
});

const { container: projectsContainer } = await database.containers.createIfNotExists(
  {
    id: "projects",
    partitionKey: {
      paths: ["/ownerUserId"],
    },
  },
);

const { container: projectMembersContainer } =
  await database.containers.createIfNotExists({
    id: "projectMembers",
    partitionKey: {
      paths: ["/projectId"],
    },
  });

const { container: tasksContainer } = await database.containers.createIfNotExists(
  {
    id: "tasks",
    partitionKey: {
      paths: ["/projectId"],
    },
  },
);

const seedTimestamp = "2026-04-17T00:00:00.000Z";
const userId = "microsoft:demo-user";

const userDocument = {
  id: userId,
  kind: "user",
  provider: "microsoft",
  providerUserId: "demo-user",
  selectedProjectId: "project_habit_english",
  email: "demo@example.com",
  displayName: "Demo User",
  avatarUrl: null,
  lastLoginAt: seedTimestamp,
  createdAt: seedTimestamp,
  updatedAt: seedTimestamp,
};

const projectDocuments = [
  {
    id: "project_habit_english",
    kind: "project",
    ownerUserId: userId,
    name: "English Habit",
    description: "Practice reading every day.",
    type: "habit",
    status: "active",
    alertEnabled: false,
    createdAt: seedTimestamp,
    updatedAt: seedTimestamp,
  },
  {
    id: "project_task_home",
    kind: "project",
    ownerUserId: userId,
    name: "Home Tasks",
    description: "Practical chores and errands.",
    type: "task",
    status: "active",
    alertEnabled: true,
    createdAt: seedTimestamp,
    updatedAt: seedTimestamp,
  },
  {
    id: "project_task_work",
    kind: "project",
    ownerUserId: userId,
    name: "Work Ops",
    description: "Operational follow-ups and deadlines.",
    type: "task",
    status: "active",
    alertEnabled: true,
    createdAt: seedTimestamp,
    updatedAt: seedTimestamp,
  },
];

const projectMemberDocuments = [
  {
    id: "invite_demo_friend",
    kind: "project-member",
    projectId: "project_task_home",
    userId: null,
    invitedEmail: "friend@example.com",
    role: "manager",
    status: "pending",
    invitedByUserId: userId,
    createdAt: seedTimestamp,
    updatedAt: seedTimestamp,
  },
];

const taskDocuments = [
  {
    id: "task_home_1",
    kind: "task",
    projectId: "project_task_home",
    title: "Empty the trash",
    description: null,
    dueDate: null,
    repeatRule: null,
    createdAt: seedTimestamp,
    updatedAt: seedTimestamp,
  },
  {
    id: "task_home_2",
    kind: "task",
    projectId: "project_task_home",
    title: "Buy milk",
    description: null,
    dueDate: null,
    repeatRule: null,
    createdAt: seedTimestamp,
    updatedAt: seedTimestamp,
  },
  {
    id: "task_english_1",
    kind: "task",
    projectId: "project_habit_english",
    title: "Read one paragraph",
    description: null,
    dueDate: null,
    repeatRule: "FREQ=DAILY",
    createdAt: seedTimestamp,
    updatedAt: seedTimestamp,
  },
];

await usersContainer.items.upsert(userDocument);

for (const project of projectDocuments) {
  await projectsContainer.items.upsert(project);
}

for (const member of projectMemberDocuments) {
  await projectMembersContainer.items.upsert(member);
}

for (const task of taskDocuments) {
  await tasksContainer.items.upsert(task);
}

console.log(
  JSON.stringify(
    {
      databaseId,
      containers: ["users", "projects", "projectMembers", "tasks"],
      insertedDocuments:
        1 +
        projectDocuments.length +
        projectMemberDocuments.length +
        taskDocuments.length,
      userId,
      projectIds: projectDocuments.map((project) => project.id),
    },
    null,
    2,
  ),
);

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const rawValue = line.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, "");

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}
