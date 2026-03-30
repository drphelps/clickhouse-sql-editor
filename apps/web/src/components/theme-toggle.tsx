import { useTheme } from "next-themes";
import type { ThemePreference } from "./theme-provider";

const options: Array<{ label: string; value: ThemePreference }> = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "System", value: "system" },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="inline-flex items-center rounded-md border border-border/70 bg-background p-0.5">
      {options.map((option) => (
        <button
          aria-pressed={theme === option.value}
          className={`rounded px-2 py-1 text-xs transition-colors ${
            theme === option.value
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground"
          }`}
          key={option.value}
          onClick={() => setTheme(option.value)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
