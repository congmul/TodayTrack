import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import styles from "./page.module.css";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

const loginErrors: Record<string, string> = {
  invalid_state: "Your login session expired. Please try again.",
  oauth_error: "Azure sign-in was cancelled or rejected.",
  login_failed: "We could not finish sign-in. Please try again.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getServerSession();

  if (session) {
    redirect("/today");
  }

  const params = await searchParams;
  const errorMessage = params.error ? loginErrors[params.error] : null;

  return (
    <main className="page-shell">
      <div className="app-frame app-stack">
        <section className="hero-card">
          <div className={styles.loginShell}>
            <div className={`panel-card ${styles.loginPanel}`}>
              <div className={styles.loginCopy}>
                <span className="eyebrow">Login</span>
                <h1>Choose Microsoft or Google, then go straight to your work.</h1>
                <p>
                  TodayTrack supports Microsoft login through default Microsoft
                  Entra ID and Google login through Google OAuth. Sign in once,
                  then the backend will find or create your user record
                  automatically.
                </p>
              </div>

              {errorMessage ? (
                <span className={`badge warm ${styles.errorBadge}`}>
                  {errorMessage}
                </span>
              ) : null}

              <div className={styles.authActions}>
                <a
                  className={`button-primary ${styles.authButton}`}
                  href="/api/auth/login?provider=google"
                >
                  Continue with Google
                </a>
                <a
                  className={`button-secondary ${styles.authButton}`}
                  href="/api/auth/login?provider=microsoft"
                >
                  Continue with Microsoft
                </a>
              </div>
              <p className={styles.authHint}>
                Google and Microsoft now use separate OAuth flows, but both end
                in the same secure TodayTrack session.
              </p>
            </div>

            <aside className={`panel-card ${styles.supportCard}`}>
              <h2>What happens next</h2>
              <p className="section-copy">
                After Azure finishes authentication, TodayTrack checks whether
                your user already exists in the backend. If not, the backend
                adds you and creates an app session token in the server cache.
              </p>
              <div className="badge-row">
                <span className="badge neutral">Microsoft Entra ID</span>
                <span className="badge neutral">Google OAuth</span>
                <span className="badge neutral">Auto user sync</span>
                <span className="badge neutral">Cached app token</span>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
