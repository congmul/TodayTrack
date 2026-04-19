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
  userAgentSuffix: "TodayTrackInit",
});

const { database } = await client.databases.createIfNotExists({
  id: databaseId,
});

await database.containers.createIfNotExists({
  id: "users",
  partitionKey: {
    paths: ["/id"],
  },
});

await database.containers.createIfNotExists({
  id: "projects",
  partitionKey: {
    paths: ["/userId"],
  },
});

console.log(
  JSON.stringify(
    {
      databaseId,
      containers: ["users", "projects"],
      status: "ready",
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
