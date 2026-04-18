import Link from "next/link";
import { PrimaryNav } from "@/components/primary-nav";
import { getProjectSelection } from "@/lib/workspace-preview";
import styles from "./projects-view.module.css";

type ProjectsViewProps = {
  accountId?: string | null;
  projectId?: string | null;
};

export function ProjectsView({ accountId, projectId }: ProjectsViewProps) {
  const selection = getProjectSelection(accountId, projectId);
  const projects = selection.projects;
  const selectionQuery = `account=${selection.account.id}&project=${selection.project.id}`;

  return (
    <main className="page-shell">
      <div className="app-frame app-stack">
        <section className={`panel-card ${styles.sectionPanel}`}>
          <div className="section-header">
            <div>
              <span className="eyebrow">Projects</span>
              <h1 className="page-title">Project workspace</h1>
              <p className="section-copy">
                Only projects related to the selected account are shown here so
                the workspace stays focused and user-scoped.
              </p>
            </div>
            <div className={styles.headerActions}>
              <Link className="button-primary" href={`/projects/new?${selectionQuery}`}>
                Create project
              </Link>
              <Link className="button-secondary" href={`/today?${selectionQuery}`}>
                Back to today
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.projectList}>
          {projects.map((project) => (
            <article className="task-card" key={project.id}>
              <div className="task-topline">
                <h2>{project.name}</h2>
                <span
                  className={`badge${project.status === "active" ? " warm" : ""}`}
                >
                  {project.status === "active" ? "Active" : "Planning"}
                </span>
              </div>
              <p className="section-copy">{project.description}</p>
              <div className="badge-row">
                <span className="badge neutral">Type: {project.type}</span>
                {project.summary.map((item) => (
                  <span className="badge neutral" key={item}>
                    {item}
                  </span>
                ))}
              </div>
              <Link
                className={styles.detailLink}
                href={`/projects/${project.id}?account=${selection.account.id}&project=${project.id}`}
              >
                Open project detail
              </Link>
            </article>
          ))}
        </section>

        <PrimaryNav currentPath="/projects" />
      </div>
    </main>
  );
}
