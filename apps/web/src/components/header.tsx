import { Link } from "@tanstack/react-router";
import { ThemeToggle } from "./theme-toggle";

export default function Header() {
  const links = [{ to: "/", label: "ClickHouse SQL Editor" }] as const;

  return (
    <header className="border-border/70 border-b bg-background/95 backdrop-blur">
      <div className="flex w-full flex-row items-center justify-between px-3 py-2 md:px-5">
        <nav aria-label="Primary" className="flex items-center gap-4">
          {links.map(({ to, label }) => {
            return (
              <Link
                className="font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
                key={to}
                to={to}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
