"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import { PrimaryNav } from "@/components/primary-nav";
import { authorizedFetch } from "@/lib/auth/client-auth";
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
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSelectingProjectId, setIsSelectingProjectId] = useState<string | null>(
    null,
  );
  const [activeProjectId, setActiveProjectId] = useState(
    selectedProjectId ?? projects[0]?.id ?? null,
  );
  const resolvedSelectedProjectId = activeProjectId ?? projects[0]?.id ?? null;
  const selectedProjectName =
    projects.find((project) => project.id === resolvedSelectedProjectId)?.name ?? null;
  const selectionQuery = resolvedSelectedProjectId
    ? `project=${resolvedSelectedProjectId}`
    : "";

  async function handleSelectProject(
    event: React.MouseEvent<HTMLButtonElement>,
    projectId: string,
  ) {
    event.stopPropagation();
    event.preventDefault();

    if (projectId === resolvedSelectedProjectId || isSelectingProjectId) {
      return;
    }

    setErrorMessage(null);
    setIsSelectingProjectId(projectId);

    try {
      const response = await authorizedFetch("/api/auth/session", {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          projectId,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error ?? "Unable to select this project.");
      }

      setActiveProjectId(projectId);
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to select this project.",
      );
    } finally {
      setIsSelectingProjectId(null);
    }
  }

  function openProjectDetail(projectId: string) {
    router.push(`/projects/${projectId}?project=${projectId}`);
  }

  function handleCardKeyDown(
    event: React.KeyboardEvent<HTMLElement>,
    projectId: string,
  ) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openProjectDetail(projectId);
    }
  }

  return (
    <main className="page-shell">
      <div className="app-frame app-stack">
        <AppHeader selectedProjectName={selectedProjectName} />

        <section className={`panel-card ${styles.sectionPanel}`}>
          <div className="section-header">
            <div>
              <span className="eyebrow">Projects</span>
              <h1 className="page-title">Project workspace</h1>
              <p className="section-copy">
                {hasProjects
                  ? "Owned and shared projects are shown here so you can choose the workspace you want to focus on."
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
            </div>
          </div>
          {errorMessage ? (
            <p className={styles.selectError} role="alert">
              {errorMessage}
            </p>
          ) : null}
        </section>

        {hasProjects ? (
          <section className={styles.projectList}>
            {projects.map((project) => {
              const isSelected = project.id === resolvedSelectedProjectId;
              const selectLabel = isSelected ? "Selected" : "Select project";

              return (
                <article
                  aria-label={project.name}
                  className={`task-card ${styles.projectCard}${
                    isSelected ? ` ${styles.projectCardSelected}` : ""
                  }`}
                  key={project.id}
                  onClick={() => openProjectDetail(project.id)}
                  onKeyDown={(event) => handleCardKeyDown(event, project.id)}
                  role="link"
                  tabIndex={0}
                >
                  <div className="task-topline">
                    <h2>{project.name}</h2>
                    <div className="badge-row">
                      {isSelected ? <span className="badge neutral">Selected</span> : null}
                      <span
                        className={`badge${
                          project.status === "active" ? " warm" : ""
                        }`}
                      >
                        {project.status === "active" ? "Active" : "Archived"}
                      </span>
                    </div>
                  </div>

                  <p className="section-copy">
                    {project.description ?? "No description added yet."}
                  </p>

                  <div className="badge-row">
                    <span className="badge neutral">Type: {project.type}</span>
                    <span className="badge neutral">Tasks: {project.taskCount}</span>
                    <span className="badge neutral">{project.accessRole}</span>
                  </div>

                  <div className={styles.cardFooter}>
                    <button
                      className={isSelected ? "button-secondary" : "button-primary"}
                      disabled={Boolean(isSelectingProjectId) || isSelected}
                      onClick={(event) => handleSelectProject(event, project.id)}
                      type="button"
                    >
                      {isSelectingProjectId === project.id ? "Selecting..." : selectLabel}
                    </button>
                  </div>
                </article>
              );
            })}
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
          selectedProjectId={resolvedSelectedProjectId}
        />
      </div>
    </main>
  );
}
