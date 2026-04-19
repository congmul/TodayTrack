"use client";

import Link from "next/link";
import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import { PrimaryNav } from "@/components/primary-nav";
import { authorizedFetch } from "@/lib/auth/client-auth";
import styles from "./project-create-form.module.css";

type ProjectTypeOption = "" | "habit" | "task";

type ProjectCreateFormProps = {
  projects: Array<{
    id: string;
    name: string;
  }>;
  selectedProjectId?: string | null;
};

export function ProjectCreateForm({
  projects,
  selectedProjectId = null,
}: ProjectCreateFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ProjectTypeOption>("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = Boolean(name.trim() && type) && !isSubmitting;

  const hasProjects = projects.length > 0;
  const selectedProjectName =
    projects.find((project) => project.id === selectedProjectId)?.name ?? null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const response = await authorizedFetch("/api/projects", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          type,
        }),
      });

      const payload = (await response.json()) as
        | { project: { id: string; name: string; type: "habit" | "task" } }
        | { error: string };

      if (!response.ok || !("project" in payload)) {
        setErrorMessage(
          "error" in payload ? payload.error : "Unable to create project.",
        );
        return;
      }

      setStatusMessage(
        `Created ${payload.project.type} project "${payload.project.name}".`,
      );
      setName("");
      setDescription("");
      setType("");
    } catch {
      setErrorMessage("Unable to reach the project API.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page-shell">
      <div className="app-frame app-stack">
        <AppHeader selectedProjectName={selectedProjectName} />

        <section className={`panel-card ${styles.sectionPanel}`}>
          <div className="section-header">
            <div>
              <span className="eyebrow">New Project</span>
              <h1 className="page-title">Create a project</h1>
              <p className="section-copy">
                Choose whether this project is a <strong>habit</strong> or a{" "}
                <strong>task</strong> project so the app can apply the right
                behavior.
              </p>
            </div>
            <Link className="button-secondary" href="/projects">
              Back to projects
            </Link>
          </div>
        </section>

        <section className={styles.formGrid}>
          <form className="task-card" onSubmit={handleSubmit}>
            <div className={styles.fieldStack}>
              <label className={styles.fieldLabel} htmlFor="projectName">
                Project name
              </label>
              <input
                className={styles.fieldInput}
                id="projectName"
                name="projectName"
                onChange={(event) => setName(event.target.value)}
                placeholder="Morning Routine"
                value={name}
              />
            </div>

            <div className={styles.fieldStack}>
              <label className={styles.fieldLabel} htmlFor="projectDescription">
                Description
              </label>
              <textarea
                className={styles.fieldTextarea}
                id="projectDescription"
                name="projectDescription"
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Optional context for this project"
                rows={4}
                value={description}
              />
            </div>

            <div className={styles.fieldStack}>
              <label className={styles.fieldLabel} htmlFor="projectType">
                Project type
              </label>
              <select
                className={styles.fieldInput}
                id="projectType"
                name="projectType"
                onChange={(event) =>
                  setType(event.target.value as ProjectTypeOption)
                }
                value={type}
              >
                <option value="">Select a project type</option>
                <option value="habit">Habit</option>
                <option value="task">Task</option>
              </select>
            </div>

            <button
              className="button-primary"
              disabled={!canSubmit}
              type="submit"
            >
              {isSubmitting ? "Creating..." : "Create project"}
            </button>
          </form>

          <aside className="task-card">
            <h2>Type guidance</h2>
            <div className="badge-row">
              <span className="badge neutral">Habit</span>
              <span className="badge neutral">Task</span>
            </div>
            <p className="section-copy">
              Habit projects emphasize completion rate and streaks. Task projects
              emphasize urgency, due dates, and alerts.
            </p>

            {statusMessage ? (
              <p className={styles.successMessage} role="status">
                {statusMessage}
              </p>
            ) : null}

            {errorMessage ? (
              <p className={styles.errorMessage} role="alert">
                {errorMessage}
              </p>
            ) : null}
          </aside>
        </section>

        <PrimaryNav
          currentPath="/projects"
          hasProjects={hasProjects}
          selectedProjectId={selectedProjectId}
        />
      </div>
    </main>
  );
}
