import {
  cosmosContainers,
  cosmosDatabaseId,
  isProjectTypeValue,
} from "@/lib/db/cosmos-schema";

describe("Cosmos schema contract", () => {
  it("defines the app database and containers for account, user, and project management", () => {
    expect(cosmosDatabaseId).toBeTruthy();
    expect(cosmosContainers.accounts).toEqual({
      id: "accounts",
      partitionKey: "/id",
    });
    expect(cosmosContainers.users).toEqual({
      id: "users",
      partitionKey: "/id",
    });
    expect(cosmosContainers.projects).toEqual({
      id: "projects",
      partitionKey: "/accountId",
    });
  });

  it("keeps project types aligned with the product contract", () => {
    expect(isProjectTypeValue("habit")).toBe(true);
    expect(isProjectTypeValue("task")).toBe(true);
    expect(isProjectTypeValue("unknown")).toBe(false);
  });
});
