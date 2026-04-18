"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { listAccounts, listProjectsForAccount } from "@/lib/workspace-preview";
import styles from "./workspace-nav.module.css";

export function WorkspaceNav() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedAccountId =
    searchParams.get("account") ?? listAccounts()[0]?.id ?? "";
  const accountProjects = listProjectsForAccount(selectedAccountId);
  const selectedProjectId =
    searchParams.get("project") ?? accountProjects[0]?.id ?? "";

  function updateSelections(nextAccountId: string, nextProjectId?: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("account", nextAccountId);

    const projects = listProjectsForAccount(nextAccountId);
    const resolvedProjectId =
      nextProjectId && projects.some((project) => project.id === nextProjectId)
        ? nextProjectId
        : projects[0]?.id;

    if (resolvedProjectId) {
      params.set("project", resolvedProjectId);
    } else {
      params.delete("project");
    }

    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <section className={styles.workspaceBar} aria-label="Workspace selection">
      <div className={styles.selectorGroup}>
        <label className={styles.selectorLabel} htmlFor="accountSelect">
          Account
        </label>
        <select
          className={styles.selectorInput}
          id="accountSelect"
          onChange={(event) => updateSelections(event.target.value)}
          value={selectedAccountId}
        >
          {listAccounts().map((account) => (
            <option key={account.id} value={account.id}>
              {account.name} ({account.userName})
            </option>
          ))}
        </select>
      </div>

      <div className={styles.selectorGroup}>
        <label className={styles.selectorLabel} htmlFor="projectSelect">
          Project
        </label>
        <select
          className={styles.selectorInput}
          id="projectSelect"
          onChange={(event) =>
            updateSelections(selectedAccountId, event.target.value)
          }
          value={selectedProjectId}
        >
          {accountProjects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}
