import Link from "next/link";
import { PrimaryNav } from "@/components/primary-nav";
import type { ProjectDto } from "@/lib/services/project-service";
import styles from "./history-view.module.css";

type HistoryViewProps = {
  project: ProjectDto;
  projects: ProjectDto[];
};

export function HistoryView({ project, projects }: HistoryViewProps) {
  const navProjects = projects.map((item) => ({
    id: item.id,
    name: item.name,
  }));

  return (
    <main className="page-shell">
      <div className="app-frame app-stack">
        <section className={`panel-card ${styles.sectionPanel}`}>
          <div className="section-header">
            <div>
              <span className="eyebrow">History</span>
              <h1 className="page-title">History will follow real task activity</h1>
              <p className="section-copy">
                Completion trends are not shown yet because task history is still
                waiting on the task backend. The selected project is ready for
                that next step.
              </p>
            </div>
            <div className="badge-row">
              <span className="badge warm">{project.name}</span>
            </div>
            <Link className="button-secondary" href={`/projects?project=${project.id}`}>
              Back to projects
            </Link>
          </div>
        </section>

        <section className={styles.placeholderGrid}>
          <article className="panel-card">
            <h2>No completion history yet</h2>
            <p className="section-copy">
              This page will become active once tasks can be created, completed,
              and tracked over time for the selected project.
            </p>
          </article>
        </section>

        <PrimaryNav
          currentPath="/history"
          hasProjects
          projects={navProjects}
          selectedProjectId={project.id}
        />
      </div>
    </main>
  );
}
