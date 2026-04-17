import { getDashboardPreview } from "@/lib/dashboard-preview";

const navItems = [
  { label: "Today", icon: "◎", active: true },
  { label: "Projects", icon: "◻", active: false },
  { label: "History", icon: "△", active: false },
];

export default function Home() {
  const preview = getDashboardPreview();

  return (
    <main className="page-shell">
      <div className="app-frame">
        <section className="hero-card">
          <div className="hero-grid">
            <div className="hero-copy">
              <span className="eyebrow">Mobile-first PWA MVP</span>
              <h1>Keep today&apos;s work clear, calm, and moving.</h1>
              <p>
                TodayTrack is designed around the fastest path from opening the
                app to finishing the next task inside a project.
              </p>
              <div className="hero-actions">
                <a className="button-primary" href="#today">
                  View today&apos;s tasks
                </a>
                <a className="button-secondary" href="#history">
                  Explore analytics
                </a>
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

        <section className="section-stack" id="today">
          <div>
            <div className="section-header">
              <div>
                <h2>Today&apos;s tasks</h2>
                <p className="section-copy">
                  Due today plus overdue unfinished work, prioritized for quick
                  action on mobile.
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

          <aside className="panel-card desktop-only" id="history">
            <h2>History preview</h2>
            <p className="section-copy">
              Completion analytics will be driven by task history events so
              reopened work stays accurate over time.
            </p>

            <div className="section-stack">
              {preview.history.map((entry) => (
                <div key={entry.label}>
                  <div className="task-topline">
                    <strong>{entry.label}</strong>
                    <span>{entry.value}</span>
                  </div>
                  <p className="muted-copy">{entry.detail}</p>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <nav aria-label="Primary" className="bottom-nav">
          {navItems.map((item) => (
            <a
              className={`nav-item${item.active ? " active" : ""}`}
              href={item.active ? "#today" : "#"}
              key={item.label}
            >
              <span aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
      </div>
    </main>
  );
}
