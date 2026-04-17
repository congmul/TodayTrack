import Link from "next/link";
import { PrimaryNav } from "@/components/primary-nav";
import { getDashboardPreview } from "@/lib/dashboard-preview";

export function TodayView() {
  const preview = getDashboardPreview();

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
              <div className="hero-actions">
                <Link className="button-primary" href="/projects">
                  Open projects
                </Link>
                <Link className="button-secondary" href="/history">
                  View history
                </Link>
              </div>
            </div>

            <div className="stats-grid" aria-label="dashboard summary">
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

        <section className="section-stack">
          <div>
            <div className="section-header">
              <div>
                <h2>Today&apos;s tasks</h2>
                <p className="section-copy">
                  This route is dedicated to the daily queue instead of sharing a
                  single page with unrelated product areas.
                </p>
              </div>
              <span className="badge warm">{preview.projectName}</span>
            </div>

            <div className="tasks-grid">
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

          <aside className="panel-card desktop-only">
            <h2>Today route notes</h2>
            <p className="section-copy">
              Task details should move toward full pages or sheets rather than
              modal-first flows.
            </p>
            <div className="section-stack compact-stack">
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
