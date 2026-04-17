import Link from "next/link";
import { PrimaryNav } from "@/components/primary-nav";
import { getDashboardPreview } from "@/lib/dashboard-preview";
import styles from "./projects-view.module.css";

export function ProjectsView() {
  const preview = getDashboardPreview();

  return (
    <main className="page-shell">
      <div className="app-frame app-stack">
        <section className={`panel-card ${styles.sectionPanel}`}>
          <div className="section-header">
            <div>
              <span className="eyebrow">Projects</span>
              <h1 className="page-title">Project workspace</h1>
              <p className="section-copy">
                Projects live on their own route so navigation matches real
                product boundaries.
              </p>
            </div>
            <Link className="button-secondary" href="/today">
              Back to today
            </Link>
          </div>
        </section>

        <section className={styles.projectList}>
          <article className="task-card">
            <div className="task-topline">
              <h2>{preview.projectName}</h2>
              <span className="badge warm">Active</span>
            </div>
            <p className="section-copy">
              The launch project driving the current daily queue and completion
              metrics.
            </p>
            <div className="badge-row">
              {preview.summary.map((item) => (
                <span className="badge neutral" key={item.label}>
                  {item.label}: {item.value}
                </span>
              ))}
            </div>
          </article>

          <article className="task-card">
            <div className="task-topline">
              <h2>Operations Refresh</h2>
              <span className="badge">Planning</span>
            </div>
            <p className="section-copy">
              Secondary project placeholder for upcoming project list behavior.
            </p>
            <div className="badge-row">
              <span className="badge neutral">Tasks: 12</span>
              <span className="badge neutral">Due this week</span>
            </div>
          </article>
        </section>

        <PrimaryNav currentPath="/projects" />
      </div>
    </main>
  );
}
