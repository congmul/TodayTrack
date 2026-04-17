import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className="page-shell">
      <div className="app-frame app-stack">
        <section className="hero-card">
          <div className="hero-grid">
            <div className="hero-copy">
              <span className="eyebrow">Mobile-first PWA MVP</span>
              <h1>Keep today&apos;s work clear, calm, and moving.</h1>
              <p>
                TodayTrack is structured around clear navigation so each core
                workflow has its own route instead of being hidden behind a
                single-page toggle.
              </p>
            </div>

            <div className={`panel-card ${styles.routeListPanel}`}>
              <h2>Open a route</h2>
              <p className="section-copy">
                Start from the focused daily queue, then move into projects or
                history with dedicated navigation endpoints.
              </p>

              <div className={styles.routeList}>
                <Link className={styles.routeLink} href="/today">
                  <strong>/today</strong>
                  <span className="muted-copy">Daily task view</span>
                </Link>
                <Link className={styles.routeLink} href="/projects">
                  <strong>/projects</strong>
                  <span className="muted-copy">Project list and summaries</span>
                </Link>
                <Link className={styles.routeLink} href="/history">
                  <strong>/history</strong>
                  <span className="muted-copy">Completion analytics preview</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
