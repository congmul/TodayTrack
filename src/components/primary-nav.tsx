"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { WorkspaceNav } from "@/components/workspace-nav";

const navItems = [
  { label: "Today", href: "/today", icon: "◎" },
  { label: "Projects", href: "/projects", icon: "◻" },
  { label: "History", href: "/history", icon: "△" },
  { label: "Account", href: "/account", icon: "☰" },
];

type PrimaryNavProps = {
  currentPath: string;
};

type NavLinksProps = {
  currentPath: string;
  query?: string;
};

function NavLinks({ currentPath, query }: NavLinksProps) {
  return (
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
  );
}

function PrimaryNavContent({ currentPath }: PrimaryNavProps) {
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  return (
    <>
      <WorkspaceNav />
      <NavLinks currentPath={currentPath} query={query} />
    </>
  );
}

export function PrimaryNav({ currentPath }: PrimaryNavProps) {
  return (
    <Suspense fallback={<NavLinks currentPath={currentPath} />}>
      <PrimaryNavContent currentPath={currentPath} />
    </Suspense>
  );
}
