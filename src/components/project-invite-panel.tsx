"use client";

import { useState } from "react";
import { authorizedFetch } from "@/lib/auth/client-auth";
import type { ProjectInvitationDto } from "@/lib/services/project-service";
import styles from "./project-invite-panel.module.css";

type ProjectInvitePanelProps = {
  invitations: ProjectInvitationDto[];
  projectId: string;
  canDeleteInvitations?: boolean;
};

export function ProjectInvitePanel({
  invitations,
  projectId,
  canDeleteInvitations = false,
}: ProjectInvitePanelProps) {
  const [email, setEmail] = useState("");
  const [items, setItems] = useState(invitations);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingInvitationId, setIsDeletingInvitationId] = useState<
    string | null
  >(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const response = await authorizedFetch(
        `/api/projects/${projectId}/invitations`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            email,
          }),
        },
      );

      const payload = (await response.json()) as
        | { invitation: ProjectInvitationDto }
        | { error: string };

      if (!response.ok || !("invitation" in payload)) {
        setErrorMessage(
          "error" in payload ? payload.error : "Unable to send the invite.",
        );
        return;
      }

      setItems((current) => [payload.invitation, ...current]);
      setEmail("");
      setStatusMessage(`Invitation sent to ${payload.invitation.invitedEmail}.`);
    } catch {
      setErrorMessage("Unable to reach the invitation API.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteInvitation(invitationId: string) {
    if (isDeletingInvitationId) {
      return;
    }

    setIsDeletingInvitationId(invitationId);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const response = await authorizedFetch(
        `/api/projects/${projectId}/invitations/${invitationId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        setErrorMessage(payload?.error ?? "Unable to remove the collaborator.");
        return;
      }

      setItems((current) =>
        current.filter((invitation) => invitation.id !== invitationId),
      );
      setStatusMessage("Collaborator removed from the project.");
    } catch {
      setErrorMessage("Unable to reach the invitation API.");
    } finally {
      setIsDeletingInvitationId(null);
    }
  }

  return (
    <article className="task-card">
      <div className={styles.headerBlock}>
        <h2>Invite collaborators</h2>
        <p className="section-copy">
          Invite another user by email so they can work with this project as a
          manager.
        </p>
      </div>

      <form className={styles.formStack} onSubmit={handleSubmit}>
        <label className={styles.fieldLabel} htmlFor="invite-email">
          Email
        </label>
        <input
          className={styles.fieldInput}
          id="invite-email"
          name="invite-email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="teammate@example.com"
          type="email"
          value={email}
        />
        <button className="button-primary" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Sending..." : "Invite user"}
        </button>
      </form>

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

      <div className={styles.inviteList}>
        {items.length > 0 ? (
          items.map((invitation) => (
            <div className={styles.inviteItem} key={invitation.id}>
              <div>
                <strong>{invitation.invitedEmail}</strong>
                <p className="section-copy">
                  {invitation.status === "active"
                    ? "Active manager access"
                    : "Pending until this email signs in"}
                </p>
              </div>
              <div className={styles.inviteActions}>
                <div className="badge-row">
                  <span className="badge neutral">{invitation.role}</span>
                  <span
                    className={`badge${
                      invitation.status === "active" ? " warm" : " neutral"
                    }`}
                  >
                    {invitation.status}
                  </span>
                </div>
                {canDeleteInvitations ? (
                  <button
                    className={styles.deleteButton}
                    disabled={isDeletingInvitationId === invitation.id}
                    onClick={() => handleDeleteInvitation(invitation.id)}
                    type="button"
                  >
                    {isDeletingInvitationId === invitation.id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                ) : null}
              </div>
            </div>
          ))
        ) : (
          <p className="section-copy">No collaborators have been invited yet.</p>
        )}
      </div>
    </article>
  );
}
