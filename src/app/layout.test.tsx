import { viewport } from "@/app/layout";

describe("layout viewport", () => {
  it("uses the blue theme color for the app shell", () => {
    expect(viewport.themeColor).toBe("#2563eb");
  });
});
