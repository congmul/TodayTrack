import Link from "next/link";
import styles from "./app-header.module.css";

type AppHeaderProps = {
  selectedProjectName?: string | null;
};

export function AppHeader({ selectedProjectName = null }: AppHeaderProps) {
  const hasSelectedProject = Boolean(selectedProjectName);

  return (
    <header className={styles.header}>
      <Link className={styles.brandLink} href="/projects">
        <span aria-hidden="true" className={styles.logoMark}>
          <svg
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 6.5H17M7 12H17M7 17.5H13.5"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="2.1"
            />
            <circle cx="16.5" cy="17.5" fill="currentColor" r="1.5" />
          </svg>
        </span>
        <span className={styles.brandCopy}>
          <span className={styles.brandLabel}>TodayTrack</span>
          <span className={styles.projectLabel}>Current workspace</span>
        </span>
      </Link>

      <span
        className={`badge${hasSelectedProject ? "" : " neutral"} ${styles.projectBadge}`}
      >
        {selectedProjectName ?? "No project selected"}
      </span>
    </header>
  );
}
