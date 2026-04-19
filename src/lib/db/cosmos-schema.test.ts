import {
  cosmosContainers,
  cosmosDatabaseId,
  isProjectTypeValue,
} from "@/lib/db/cosmos-schema";

describe("Cosmos schema contract", () => {
  it("defines the app database and containers for user and project management", () => {
    expect(cosmosDatabaseId).toBeTruthy();
    expect(cosmosContainers.users).toEqual({
      id: "users",
      partitionKey: "/id",
    });
    expect(cosmosContainers.projects).toEqual({
      id: "projects",
      partitionKey: "/userId",
    });
  });

  it("keeps project types aligned with the product contract", () => {
    expect(isProjectTypeValue("habit")).toBe(true);
    expect(isProjectTypeValue("task")).toBe(true);
    expect(isProjectTypeValue("unknown")).toBe(false);
  });
});
