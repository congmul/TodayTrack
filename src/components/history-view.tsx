import Link from "next/link";
import { PrimaryNav } from "@/components/primary-nav";
import { getDashboardPreview } from "@/lib/workspace-preview";
import styles from "./history-view.module.css";

type HistoryViewProps = {
  accountId?: string | null;
  projectId?: string | null;
};

export function HistoryView({ accountId, projectId }: HistoryViewProps) {
  const preview = getDashboardPreview(accountId, projectId);
  const selectionQuery = `account=${preview.account.id}&project=${preview.project.id}`;

  return (
    <main className="page-shell">
      <div className="app-frame app-stack">
        <section className={`panel-card ${styles.sectionPanel}`}>
          <div className="section-header">
            <div>
              <span className="eyebrow">History</span>
              <h1 className="page-title">Completion history</h1>
              <p className="section-copy">
                Analytics live on a dedicated route so reporting does not compete
                with daily task actions.
              </p>
            </div>
            <div className="badge-row">
              <span className="badge warm">{preview.account.name}</span>
              <span className="badge neutral">{preview.project.name}</span>
            </div>
            <Link className="button-secondary" href={`/today?${selectionQuery}`}>
              Back to today
            </Link>
          </div>
        </section>

        <section className={styles.historyGrid}>
          {preview.history.map((entry) => (
            <article className="panel-card" key={entry.label}>
              <div className="task-topline">
                <h2>{entry.label}</h2>
                <span className="badge">{entry.value}</span>
              </div>
              <p className="section-copy">{entry.detail}</p>
            </article>
          ))}
        </section>

        <PrimaryNav currentPath="/history" />
      </div>
    </main>
  );
}
