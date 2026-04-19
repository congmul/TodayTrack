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
        </section>
      </div>
    </main>
  );
}
