"use client";

import { usePathname, useRouter } from "next/navigation";
import { authorizedFetch } from "@/lib/auth/client-auth";
import styles from "./workspace-nav.module.css";

type WorkspaceNavProps = {
  projects: Array<{
    id: string;
    name: string;
  }>;
  selectedProjectId?: string | null;
};

export function WorkspaceNav({
  projects,
  selectedProjectId = null,
}: WorkspaceNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const resolvedSelectedProjectId = selectedProjectId ?? projects[0]?.id ?? "";

  async function updateSelection(nextProjectId: string) {
    const params = new URLSearchParams();
    const resolvedProjectId =
      nextProjectId && projects.some((project) => project.id === nextProjectId)
        ? nextProjectId
        : projects[0]?.id;

    if (resolvedProjectId) {
      params.set("project", resolvedProjectId);
    }

    if (resolvedProjectId) {
      await authorizedFetch("/api/auth/session", {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          projectId: resolvedProjectId,
        }),
      }).catch(() => {
        // Keep local navigation responsive even if persistence fails.
      });
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <section className={styles.workspaceBar} aria-label="Workspace selection">
      <div className={styles.selectorGroup}>
        <label className={styles.selectorLabel} htmlFor="projectSelect">
          Project
        </label>
        <select
          className={styles.selectorInput}
          id="projectSelect"
          onChange={(event) => updateSelection(event.target.value)}
          value={resolvedSelectedProjectId}
        >
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}
