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
    <main className={`${styles.loginPage} page-shell`}>
      <div className={`app-frame ${styles.loginShell}`}>
        <section className={styles.loginPanel}>
          <div className={styles.loginCopy}>
            <span className="eyebrow">TodayTrack</span>
            <h1>TodayTrack</h1>
            <p>
              Keep today&apos;s tasks, project progress, and completion history
              in one focused workspace.
            </p>
          </div>

          {errorMessage ? (
            <span className={`badge warm ${styles.errorBadge}`}>
              {errorMessage}
            </span>
          ) : null}

          <div className={styles.authActions}>
            <a
              className={`${styles.authButton} ${styles.googleButton}`}
              href="/api/auth/login?provider=google"
            >
              <span className={styles.authButtonContent}>
                <span className={styles.logoBadge} aria-hidden="true">
                  <GoogleLogo />
                </span>
                <span className={styles.authLabel}>Continue with Google</span>
              </span>
            </a>
            <a
              className={`${styles.authButton} ${styles.microsoftButton}`}
              href="/api/auth/login?provider=microsoft"
            >
              <span className={styles.authButtonContent}>
                <span className={styles.logoBadge} aria-hidden="true">
                  <MicrosoftLogo />
                </span>
                <span className={styles.authLabel}>Continue with Microsoft</span>
              </span>
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}

function GoogleLogo() {
  return (
    <svg
      aria-hidden="true"
      className={styles.providerLogo}
      viewBox="0 0 24 24"
    >
      <path
        d="M21.64 12.2c0-.64-.06-1.25-.16-1.84H12v3.48h5.4a4.63 4.63 0 0 1-2 3.04v2.52h3.24c1.9-1.76 3-4.35 3-7.2Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.7 0 4.96-.9 6.62-2.44l-3.24-2.52c-.9.6-2.04.96-3.38.96-2.6 0-4.8-1.76-5.58-4.12H3.08v2.6A9.99 9.99 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.42 13.88A5.99 5.99 0 0 1 6.1 12c0-.66.12-1.3.32-1.88V7.52H3.08A9.99 9.99 0 0 0 2 12c0 1.62.38 3.14 1.08 4.48l3.34-2.6Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.98c1.48 0 2.8.5 3.84 1.48l2.88-2.88C16.96 2.94 14.7 2 12 2a9.99 9.99 0 0 0-8.92 5.52l3.34 2.6C7.2 7.74 9.4 5.98 12 5.98Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function MicrosoftLogo() {
  return (
    <svg
      aria-hidden="true"
      className={`${styles.providerLogo} ${styles.microsoftLogo}`}
      viewBox="0 0 24 24"
    >
      <rect x="2" y="2" width="9" height="9" fill="#F25022" />
      <rect x="13" y="2" width="9" height="9" fill="#7FBA00" />
      <rect x="2" y="13" width="9" height="9" fill="#00A4EF" />
      <rect x="13" y="13" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}
