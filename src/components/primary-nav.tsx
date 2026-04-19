import Link from "next/link";
import { WorkspaceNav } from "@/components/workspace-nav";

type NavProject = {
  id: string;
  name: string;
};

type PrimaryNavProps = {
  currentPath: string;
  hasProjects: boolean;
  projects?: NavProject[];
  selectedProjectId?: string | null;
};

const fullNavItems = [
  { label: "Today", href: "/today", icon: "◎" },
  { label: "Projects", href: "/projects", icon: "◻" },
  { label: "History", href: "/history", icon: "△" },
  { label: "Account", href: "/account", icon: "☰" },
];

const onboardingNavItems = [
  { label: "Projects", href: "/projects", icon: "◻" },
  { label: "Account", href: "/account", icon: "☰" },
];

export function PrimaryNav({
  currentPath,
  hasProjects,
  projects = [],
  selectedProjectId = null,
}: PrimaryNavProps) {
  const navItems = hasProjects ? fullNavItems : onboardingNavItems;
  const query = selectedProjectId
    ? new URLSearchParams({ project: selectedProjectId }).toString()
    : "";

  return (
    <>
      {hasProjects ? (
        <WorkspaceNav projects={projects} selectedProjectId={selectedProjectId} />
      ) : null}

      <nav aria-label="Primary" className="bottom-nav">
        {navItems.map((item) => {
          const isActive = currentPath === item.href;
          const href = query ? `${item.href}?${query}` : item.href;

          return (
            <Link
              className={`nav-item${isActive ? " active" : ""}`}
              href={href}
              key={item.href}
            >
              <span aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
