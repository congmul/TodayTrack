import Link from "next/link";
import { PrimaryNav } from "@/components/primary-nav";
import { getProjectPreview } from "@/lib/project-preview";
import styles from "./project-detail-view.module.css";

type ProjectDetailViewProps = {
  projectId: string;
};

export function ProjectDetailView({ projectId }: ProjectDetailViewProps) {
  const project = getProjectPreview(projectId);

  if (!project) {
    return (
      <main className="page-shell">
        <div className="app-frame app-stack">
          <section className={`panel-card ${styles.sectionPanel}`}>
            <div className="section-header">
              <div>
                <span className="eyebrow">Project</span>
                <h1 className="page-title">Project not found</h1>
                <p className="section-copy">
                  This project id does not match the current preview dataset.
                </p>
              </div>
              <Link className="button-secondary" href="/projects">
                Back to projects
              </Link>
            </div>
          </section>

          <PrimaryNav currentPath="/projects" />
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <div className="app-frame app-stack">
        <section className={`panel-card ${styles.sectionPanel}`}>
          <div className="section-header">
            <div>
              <span className="eyebrow">Project Detail</span>
              <h1 className="page-title">{project.name}</h1>
              <p className="section-copy">{project.detail}</p>
            </div>
            <Link className="button-secondary" href="/projects">
              Back to projects
            </Link>
          </div>
        </section>

        <section className={styles.detailGrid}>
          <article className="task-card">
            <h2>Configuration</h2>
            <div className="badge-row">
              <span className="badge neutral">Type: {project.type}</span>
              <span className="badge neutral">Status: {project.status}</span>
            </div>
            <p className="section-copy">{project.description}</p>
          </article>

          <article className="task-card">
            <h2>Behavior notes</h2>
            <div className="badge-row">
              {project.summary.map((item) => (
                <span className="badge neutral" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </article>
        </section>

        <PrimaryNav currentPath="/projects" />
      </div>
    </main>
  );
}
