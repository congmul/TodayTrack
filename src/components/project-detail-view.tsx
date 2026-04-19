import Link from "next/link";
import { PrimaryNav } from "@/components/primary-nav";
import type { ProjectDto } from "@/lib/services/project-service";
import styles from "./project-detail-view.module.css";

type ProjectDetailViewProps = {
  project: ProjectDto | null;
  projects: ProjectDto[];
  selectedProjectId?: string | null;
};

export function ProjectDetailView({
  project,
  projects,
  selectedProjectId = null,
}: ProjectDetailViewProps) {
  const navProjects = projects.map((item) => ({
    id: item.id,
    name: item.name,
  }));
  const resolvedSelectedProjectId = selectedProjectId ?? projects[0]?.id ?? null;

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
                  This project does not belong to the current signed-in user.
                </p>
              </div>
              <Link className="button-secondary" href="/projects">
                Back to projects
              </Link>
            </div>
          </section>

          <PrimaryNav
            currentPath="/projects"
            hasProjects={projects.length > 0}
            projects={navProjects}
            selectedProjectId={resolvedSelectedProjectId}
          />
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
              <p className="section-copy">
                {project.description ?? "No description added yet for this project."}
              </p>
            </div>
            <Link
              className="button-secondary"
              href={`/projects?project=${project.id}`}
            >
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
          </article>

          <article className="task-card">
            <h2>Next step</h2>
            <p className="section-copy">
              Task management and completion analytics will use this project as
              the parent workspace once those backend features are available.
            </p>
          </article>
        </section>

        <PrimaryNav
          currentPath="/projects"
          hasProjects
          projects={navProjects}
          selectedProjectId={project.id}
        />
      </div>
    </main>
  );
}
