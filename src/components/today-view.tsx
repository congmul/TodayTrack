import Link from "next/link";
import { PrimaryNav } from "@/components/primary-nav";
import type { ProjectDto } from "@/lib/services/project-service";
import styles from "./today-view.module.css";

type TodayViewProps = {
  project: ProjectDto;
  projects: ProjectDto[];
};

export function TodayView({ project, projects }: TodayViewProps) {
  const navProjects = projects.map((item) => ({
    id: item.id,
    name: item.name,
  }));

  return (
    <main className="page-shell">
      <div className="app-frame app-stack">
        <section className="hero-card">
          <div className="hero-grid">
            <div className="hero-copy">
              <span className="eyebrow">Today</span>
              <h1>{project.name} is ready for task planning.</h1>
              <p>
                Task management for this route is coming next. Create and refine
                your projects first so we can attach real task work to them.
              </p>
              <div className={styles.heroActions}>
                <Link className="button-primary" href={`/projects?project=${project.id}`}>
                  Open projects
                </Link>
                <Link className="button-secondary" href={`/projects/${project.id}?project=${project.id}`}>
                  View project detail
                </Link>
              </div>
            </div>

            <article className={`panel-card ${styles.placeholderCard}`}>
              <span className="badge warm">Coming next</span>
              <h2>Tasks will appear here</h2>
              <p className="section-copy">
                Once task APIs are implemented, this route will show the daily
                queue for the selected project without relying on placeholder
                content.
              </p>
            </article>
          </div>
        </section>

        <PrimaryNav
          currentPath="/today"
          hasProjects
          projects={navProjects}
          selectedProjectId={project.id}
        />
      </div>
    </main>
  );
}
