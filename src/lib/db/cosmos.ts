import { CosmosClient } from "@azure/cosmos";

const globalForCosmos = globalThis as unknown as {
  cosmosClient?: CosmosClient;
};

export function getCosmosClient() {
  if (globalForCosmos.cosmosClient) {
    return globalForCosmos.cosmosClient;
  }

  const endpoint = process.env.COSMOSDB_ENDPOINT;
  const key = process.env.COSMOSDB_KEY;

  if (!endpoint || !key) {
    throw new Error(
      "COSMOSDB_ENDPOINT and COSMOSDB_KEY must be set to use Azure Cosmos DB.",
    );
  }

  const client = new CosmosClient({
    endpoint,
    key,
    userAgentSuffix: "TodayTrack",
  });

  if (process.env.NODE_ENV !== "production") {
    globalForCosmos.cosmosClient = client;
  }

  return client;
}
