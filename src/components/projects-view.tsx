import Link from "next/link";
import { PrimaryNav } from "@/components/primary-nav";
import { listProjectPreviews } from "@/lib/project-preview";
import styles from "./projects-view.module.css";

export function ProjectsView() {
  const projects = listProjectPreviews();

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
                href={`/projects/${project.id}`}
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
