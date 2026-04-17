import Link from "next/link";

const navItems = [
  { label: "Today", href: "/today", icon: "◎" },
  { label: "Projects", href: "/projects", icon: "◻" },
  { label: "History", href: "/history", icon: "△" },
];

type PrimaryNavProps = {
  currentPath: string;
};

export function PrimaryNav({ currentPath }: PrimaryNavProps) {
  return (
    <nav aria-label="Primary" className="bottom-nav">
      {navItems.map((item) => {
        const isActive = currentPath === item.href;

        return (
          <Link
            className={`nav-item${isActive ? " active" : ""}`}
            href={item.href}
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
