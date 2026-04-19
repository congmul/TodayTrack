"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { authorizedFetch } from "@/lib/auth/client-auth";
import { listProjects } from "@/lib/workspace-preview";
import styles from "./workspace-nav.module.css";

export function WorkspaceNav() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const availableProjects = listProjects();
  const selectedProjectId =
    searchParams.get("project") ?? availableProjects[0]?.id ?? "";

  async function updateSelection(nextProjectId: string) {
    const params = new URLSearchParams();
    const resolvedProjectId =
      nextProjectId &&
      availableProjects.some((project) => project.id === nextProjectId)
        ? nextProjectId
        : availableProjects[0]?.id;

    if (resolvedProjectId) {
      params.set("project", resolvedProjectId);
    } else {
      params.delete("project");
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

    router.push(`${pathname}?${params.toString()}`);
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
          value={selectedProjectId}
        >
          {availableProjects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}
