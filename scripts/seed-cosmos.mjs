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
      paths: ["/userId"],
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
    userId,
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
    userId,
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
    userId,
    name: "Work Ops",
    description: "Operational follow-ups and deadlines.",
    type: "task",
    status: "active",
    alertEnabled: true,
    createdAt: seedTimestamp,
    updatedAt: seedTimestamp,
  },
];

await usersContainer.items.upsert(userDocument);

for (const project of projectDocuments) {
  await projectsContainer.items.upsert(project);
}

console.log(
  JSON.stringify(
    {
      databaseId,
      containers: ["users", "projects"],
      insertedDocuments: 1 + projectDocuments.length,
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
