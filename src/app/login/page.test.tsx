import { render, screen } from "@testing-library/react";
import LoginPage from "@/app/login/page";

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

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the Google and Microsoft sign-in entry points for logged-out users", async () => {
    mockGetServerSession.mockResolvedValue(null);

    render(
      await LoginPage({
        searchParams: Promise.resolve({}),
      }),
    );

    expect(
      screen.getByRole("heading", { name: "TodayTrack" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Keep today's tasks, project progress, and completion history in one focused workspace.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("banner")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Continue with Google" })).toHaveAttribute(
      "href",
      "/api/auth/login?provider=google",
    );
    expect(
      screen.getByRole("link", { name: "Continue with Microsoft" }),
    ).toHaveAttribute("href", "/api/auth/login?provider=microsoft");
  });

  it("shows callback errors when Azure redirects back with an error code", async () => {
    mockGetServerSession.mockResolvedValue(null);

    render(
      await LoginPage({
        searchParams: Promise.resolve({ error: "login_failed" }),
      }),
    );

    expect(
      screen.getByText("We could not finish sign-in. Please try again."),
    ).toBeInTheDocument();
  });
});
