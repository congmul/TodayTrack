import Link from "next/link";
import { PrimaryNav } from "@/components/primary-nav";
import type { ProjectDto } from "@/lib/services/project-service";
import styles from "./projects-view.module.css";

type ProjectsViewProps = {
  projects: ProjectDto[];
  selectedProjectId?: string | null;
};

export function ProjectsView({
  projects,
  selectedProjectId = null,
}: ProjectsViewProps) {
  const hasProjects = projects.length > 0;
  const navProjects = projects.map((project) => ({
    id: project.id,
    name: project.name,
  }));
  const resolvedSelectedProjectId = selectedProjectId ?? projects[0]?.id ?? null;
  const selectionQuery = resolvedSelectedProjectId
    ? `project=${resolvedSelectedProjectId}`
    : "";

  return (
    <main className="page-shell">
      <div className="app-frame app-stack">
        <section className={`panel-card ${styles.sectionPanel}`}>
          <div className="section-header">
            <div>
              <span className="eyebrow">Projects</span>
              <h1 className="page-title">Project workspace</h1>
              <p className="section-copy">
                {hasProjects
                  ? "Only your projects are shown here so the workspace stays focused on your current work."
                  : "Create your first project to unlock TodayTrack's daily task and history experience."}
              </p>
            </div>
            <div className={styles.headerActions}>
              <Link
                className="button-primary"
                href={selectionQuery ? `/projects/new?${selectionQuery}` : "/projects/new"}
              >
                Create project
              </Link>
              {hasProjects && resolvedSelectedProjectId ? (
                <Link className="button-secondary" href={`/today?${selectionQuery}`}>
                  Back to today
                </Link>
              ) : null}
            </div>
          </div>
        </section>

        {hasProjects ? (
          <section className={styles.projectList}>
            {projects.map((project) => (
              <article className="task-card" key={project.id}>
                <div className="task-topline">
                  <h2>{project.name}</h2>
                  <span
                    className={`badge${project.status === "active" ? " warm" : ""}`}
                  >
                    {project.status === "active" ? "Active" : "Archived"}
                  </span>
                </div>
                <p className="section-copy">
                  {project.description ?? "No description added yet."}
                </p>
                <div className="badge-row">
                  <span className="badge neutral">Type: {project.type}</span>
                </div>
                <Link
                  className={styles.detailLink}
                  href={`/projects/${project.id}?project=${project.id}`}
                >
                  Open project detail
                </Link>
              </article>
            ))}
          </section>
        ) : (
          <section className={styles.onboardingGrid}>
            <article className="task-card">
              <div className={styles.emptyState}>
                <span className="badge warm">Start here</span>
                <h2>Create your first project</h2>
                <p className="section-copy">
                  Projects organize the work you will see in Today and the
                  completion trends you will review later in History.
                </p>
                <Link className="button-primary" href="/projects/new">
                  Create project
                </Link>
              </div>
            </article>
          </section>
        )}

        <PrimaryNav
          currentPath="/projects"
          hasProjects={hasProjects}
          projects={navProjects}
          selectedProjectId={resolvedSelectedProjectId}
        />
      </div>
    </main>
  );
}
