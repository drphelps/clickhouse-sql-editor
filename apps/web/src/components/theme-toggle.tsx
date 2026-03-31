import { ButtonGroup } from "@clickhouse/click-ui";
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
    <ButtonGroup
      onClick={(value) => setTheme(value as ThemePreference)}
      options={options}
      selected={theme ?? "system"}
      type="default"
    />
  );
}
