"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authorizedFetch } from "@/lib/auth/client-auth";
import styles from "./project-danger-zone.module.css";

type ProjectDangerZoneProps = {
  projectId: string;
  projectName: string;
};

export function ProjectDangerZone({
  projectId,
  projectName,
}: ProjectDangerZoneProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [confirmationName, setConfirmationName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (confirmationName !== projectName || isDeleting) {
      return;
    }

    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const response = await authorizedFetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        setErrorMessage(payload?.error ?? "Unable to delete the project.");
        return;
      }

      router.push("/projects");
      router.refresh();
    } catch {
      setErrorMessage("Unable to reach the project API.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className={styles.dangerZone}>
      <button
        className={styles.deleteTrigger}
        onClick={() => setIsExpanded((current) => !current)}
        type="button"
      >
        Delete project
      </button>

      {isExpanded ? (
        <div className={styles.confirmationCard}>
          <p className={styles.warningCopy}>
            Are you sure? Type <strong>{projectName}</strong> to delete this
            project.
          </p>
          <input
            className={styles.confirmInput}
            onChange={(event) => setConfirmationName(event.target.value)}
            placeholder={projectName}
            type="text"
            value={confirmationName}
          />
          <div className={styles.actionRow}>
            <button
              className={styles.confirmDelete}
              disabled={confirmationName !== projectName || isDeleting}
              onClick={handleDelete}
              type="button"
            >
              {isDeleting ? "Deleting..." : "Delete permanently"}
            </button>
            <button
              className="button-secondary"
              onClick={() => {
                setIsExpanded(false);
                setConfirmationName("");
                setErrorMessage(null);
              }}
              type="button"
            >
              Cancel
            </button>
          </div>
          {errorMessage ? (
            <p className={styles.errorMessage} role="alert">
              {errorMessage}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
