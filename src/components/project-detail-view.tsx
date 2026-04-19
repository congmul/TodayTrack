import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { ProjectDangerZone } from "@/components/project-danger-zone";
import { ProjectInvitePanel } from "@/components/project-invite-panel";
import { PrimaryNav } from "@/components/primary-nav";
import type { ProjectDetailDto, ProjectDto } from "@/lib/services/project-service";
import styles from "./project-detail-view.module.css";

type ProjectDetailViewProps = {
  project: ProjectDetailDto | null;
  projects: ProjectDto[];
  selectedProjectName?: string | null;
};

export function ProjectDetailView({
  project,
  projects,
  selectedProjectName = null,
}: ProjectDetailViewProps) {
  const resolvedSelectedProjectId = project?.id ?? projects[0]?.id ?? null;

  if (!project) {
    return (
      <main className="page-shell">
        <div className="app-frame app-stack">
          <AppHeader selectedProjectName={selectedProjectName} />

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
            selectedProjectId={resolvedSelectedProjectId}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <div className="app-frame app-stack">
        <AppHeader selectedProjectName={project.name} />

        <section className={`panel-card ${styles.sectionPanel}`}>
          <div className="section-header">
            <div>
              <span className="eyebrow">Project Detail</span>
              <h1 className="page-title">{project.name}</h1>
              <p className="section-copy">
                {project.description ?? "No description added yet for this project."}
              </p>
            </div>
            <div className={styles.headerActions}>
              {project.accessRole === "owner" ? (
                <ProjectDangerZone
                  projectId={project.id}
                  projectName={project.name}
                />
              ) : null}
              <Link
                className="button-secondary"
                href={`/projects?project=${project.id}`}
              >
                Back to projects
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.detailGrid}>
          <article className="task-card">
            <h2>Configuration</h2>
            <div className="badge-row">
              <span className="badge neutral">Type: {project.type}</span>
              <span className="badge neutral">Status: {project.status}</span>
              <span className="badge neutral">Tasks: {project.taskCount}</span>
              <span className="badge neutral">{project.accessRole}</span>
            </div>
          </article>

          <article className="task-card">
            <h2>Next step</h2>
            <p className="section-copy">
              Task management and completion analytics will use this project as
              the parent workspace once those backend features are available.
            </p>
          </article>

          <ProjectInvitePanel
            canDeleteInvitations={project.accessRole === "owner"}
            invitations={project.invitations}
            projectId={project.id}
          />
        </section>

        <PrimaryNav
          currentPath="/projects"
          hasProjects
          selectedProjectId={project.id}
        />
      </div>
    </main>
  );
}
