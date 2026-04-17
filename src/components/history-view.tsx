import Link from "next/link";
import { PrimaryNav } from "@/components/primary-nav";
import { getDashboardPreview } from "@/lib/dashboard-preview";

export function HistoryView() {
  const preview = getDashboardPreview();

  return (
    <main className="page-shell">
      <div className="app-frame app-stack">
        <section className="panel-card section-panel">
          <div className="section-header">
            <div>
              <span className="eyebrow">History</span>
              <h1 className="page-title">Completion history</h1>
              <p className="section-copy">
                Analytics live on a dedicated route so reporting does not compete
                with daily task actions.
              </p>
            </div>
            <Link className="button-secondary" href="/today">
              Back to today
            </Link>
          </div>
        </section>

        <section className="history-grid">
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
