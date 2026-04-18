import Home from "@/app/page";

const mockGetServerSession = vi.fn();
const mockRedirect = vi.fn();

vi.mock("@/lib/auth/session", () => ({
  getServerSession: (...args: unknown[]) => mockGetServerSession(...args),
}));

vi.mock("next/navigation", async () => {
  const actual = await vi.importActual<typeof import("next/navigation")>(
    "next/navigation",
  );

  return {
    ...actual,
    redirect: (...args: unknown[]) => mockRedirect(...args),
  };
});

describe("Home", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects unauthenticated visitors to login first", async () => {
    mockGetServerSession.mockResolvedValue(null);

    await Home();

    expect(mockRedirect).toHaveBeenCalledWith("/login");
  });

  it("redirects authenticated visitors to today", async () => {
    mockGetServerSession.mockResolvedValue({
      token: "session-token",
      user: {
        id: "azure:azure-user-123",
      },
      expiresAt: Date.now() + 1000,
    });

    await Home();

    expect(mockRedirect).toHaveBeenCalledWith("/today");
  });
});
