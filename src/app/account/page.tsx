import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { PrimaryNav } from "@/components/primary-nav";
import { clearServerSession, requireServerSession } from "@/lib/auth/session";
import { createWorkspaceService } from "@/lib/services/workspace-service";
import styles from "./page.module.css";

export default async function AccountPage() {
  const session = await requireServerSession();
  const workspaceService = createWorkspaceService();
  const context = await workspaceService.getWorkspaceContext(
    session.user.id,
    session.user.selectedProjectId,
  );

  async function logoutAction() {
    "use server";

    await clearServerSession();
    redirect("/login");
  }

  return (
    <main className="page-shell">
      <div className="app-frame app-stack">
        <AppHeader selectedProjectName={context.selectedProject?.name} />

        <section className={`panel-card ${styles.sectionPanel}`}>
          <div className="section-header">
            <div>
              <span className="eyebrow">Account</span>
              <h1 className="page-title">Account and session</h1>
              <p className="section-copy">
                Review the signed-in account and end the current session from a
                dedicated route.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.profileGrid}>
          <article className="task-card">
            <h2>{session.user.displayName}</h2>
            <div className="badge-row">
              <span className="badge warm">Azure OAuth</span>
              <span className="badge neutral">Cached session</span>
            </div>
            <p className="section-copy">
              {session.user.email ?? "No email claim was returned by Azure."}
            </p>
          </article>

          <article className="task-card">
            <h2>Session details</h2>
            <p className="section-copy">
              Provider user id: {session.user.providerUserId}
            </p>
            <p className="section-copy">
              Last login: {new Date(session.user.lastLoginAt).toLocaleString()}
            </p>
          </article>
        </section>

        <section className={`panel-card ${styles.logoutCard}`}>
          <div>
            <h2>Logout</h2>
            <p className="section-copy">
              Sign out from TodayTrack on this device. You can sign in again at
              any time with Google through Azure.
            </p>
          </div>

          <form action={logoutAction} className={styles.logoutForm}>
            <button className={`button-primary ${styles.logoutButton}`} type="submit">
              Logout
            </button>
          </form>
        </section>

        <PrimaryNav
          currentPath="/account"
          hasProjects={context.hasProjects}
          selectedProjectId={context.selectedProject?.id}
        />
      </div>
    </main>
  );
}
