import Link from "next/link";
import { PrimaryNav } from "@/components/primary-nav";
import { getDashboardPreview } from "@/lib/workspace-preview";
import styles from "./today-view.module.css";

type TodayViewProps = {
  projectId?: string | null;
};

export function TodayView({ projectId }: TodayViewProps) {
  const preview = getDashboardPreview(projectId);
  const selectionQuery = `project=${preview.project.id}`;

  return (
    <main className="page-shell">
      <div className="app-frame app-stack">
        <section className="hero-card">
          <div className="hero-grid">
            <div className="hero-copy">
              <span className="eyebrow">Today</span>
              <h1>Keep today&apos;s work clear, calm, and moving.</h1>
              <p>
                Due today plus overdue unfinished work, prioritized for quick
                action on mobile.
              </p>
              <div className={styles.heroActions}>
                <Link className="button-primary" href={`/projects?${selectionQuery}`}>
                  Open projects
                </Link>
                <Link className="button-secondary" href={`/history?${selectionQuery}`}>
                  View history
                </Link>
              </div>
            </div>

            <div className={styles.statsGrid} aria-label="dashboard summary">
              {preview.summary.map((item) => (
                <article className="panel-card" key={item.label}>
                  <span className="stat-label">{item.label}</span>
                  <div className="stat-value">{item.value}</div>
                  <p className="muted-copy">{item.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.sectionStack}>
          <div>
            <div className="section-header">
              <div>
                <h2>Today&apos;s tasks</h2>
                <p className="section-copy">
                  This route is dedicated to the daily queue instead of sharing a
                  single page with unrelated product areas.
                </p>
              </div>
              <span className="badge warm">{preview.project.name}</span>
            </div>

            <div className={styles.tasksGrid}>
              {preview.tasks.map((task) => (
                <article className="task-card" key={task.id}>
                  <div className="task-topline">
                    <span className={`status-pill${task.done ? "" : " neutral"}`}>
                      {task.done ? "Done" : "Open"}
                    </span>
                    <div className="badge-row">
                      <span className="badge">{task.priority}</span>
                      <span className="badge neutral">{task.dueLabel}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className={`task-title${task.done ? " done" : ""}`}>
                      {task.title}
                    </h3>
                    <p className="task-meta">{task.note}</p>
                  </div>

                  <div className="task-footer">
                    <span className="muted-copy">Assigned to {task.assignee}</span>
                    <span className="badge neutral">{task.tag}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className={`panel-card ${styles.desktopOnly}`}>
            <h2>Today route notes</h2>
            <p className="section-copy">
              Task details should move toward full pages or sheets rather than
              modal-first flows.
            </p>
            <div className={`${styles.sectionStack} ${styles.compactStack}`}>
              <div>
                <strong>Primary job</strong>
                <p className="muted-copy">
                  Fast toggling, clear task state, and focused next actions.
                </p>
              </div>
              <div>
                <strong>Future expansion</strong>
                <p className="muted-copy">
                  Add task detail routes and project-specific task pages here.
                </p>
              </div>
            </div>
          </aside>
        </section>

        <PrimaryNav currentPath="/today" />
      </div>
    </main>
  );
}
