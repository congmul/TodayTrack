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

const { container: accountsContainer } = await database.containers.createIfNotExists(
  {
    id: "accounts",
    partitionKey: {
      paths: ["/id"],
    },
  },
);

const { container: projectsContainer } = await database.containers.createIfNotExists(
  {
    id: "projects",
    partitionKey: {
      paths: ["/accountId"],
    },
  },
);

const seedTimestamp = "2026-04-17T00:00:00.000Z";
const accountId = "account_demo";

const accountDocument = {
  id: accountId,
  kind: "account",
  name: "Demo Account",
  createdAt: seedTimestamp,
  updatedAt: seedTimestamp,
};

const projectDocuments = [
  {
    id: "project_habit_english",
    kind: "project",
    accountId,
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
    accountId,
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
    accountId,
    name: "Work Ops",
    description: "Operational follow-ups and deadlines.",
    type: "task",
    status: "active",
    alertEnabled: true,
    createdAt: seedTimestamp,
    updatedAt: seedTimestamp,
  },
];

await accountsContainer.items.upsert(accountDocument);

for (const project of projectDocuments) {
  await projectsContainer.items.upsert(project);
}

console.log(
  JSON.stringify(
    {
      databaseId,
      containers: ["accounts", "projects"],
      insertedDocuments: 1 + projectDocuments.length,
      accountId,
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
