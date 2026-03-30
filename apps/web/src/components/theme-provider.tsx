import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

export type ThemePreference = "light" | "dark" | "system";

const themeStorageKey = "theme-preference";

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      disableTransitionOnChange
      enableSystem
      storageKey={themeStorageKey}
    >
      {children}
    </NextThemesProvider>
  );
}
