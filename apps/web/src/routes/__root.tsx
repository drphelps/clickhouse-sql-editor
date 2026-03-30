import { ClickUIProvider } from "@clickhouse/click-ui";
import { Toaster } from "@clickhouse-sql-editor/ui/components/sonner";
import {
  ClientOnly,
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import Header from "../components/header";
import { ThemeProvider, useTheme } from "../components/theme-provider";
import appCss from "../index.css?url";

export type RouterAppContext = Record<string, never>;

export const Route = createRootRouteWithContext<RouterAppContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "My App",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),

  component: RootDocument,
});

const routeFallback = <div className="h-full min-h-0 min-w-0" />;
const themeInitScript = `
(() => {
  const storageKey = "theme-preference";
  const stored = window.localStorage.getItem(storageKey);
  const preference =
    stored === "light" || stored === "dark" || stored === "system"
      ? stored
      : "system";
  const isDark =
    preference === "dark" ||
    (preference === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", isDark);
})();
`;

function RootDocument() {
  return (
    <html lang="en">
      <head>
        <script>{themeInitScript}</script>
        <HeadContent />
      </head>
      <body>
        <ClientOnly fallback={routeFallback}>
          <ThemeProvider>
            <ThemedApp />
          </ThemeProvider>
        </ClientOnly>
        <Toaster richColors />
        <TanStackRouterDevtools position="bottom-left" />
        <Scripts />
      </body>
    </html>
  );
}

function ThemedApp() {
  const { resolvedTheme } = useTheme();

  return (
    <ClickUIProvider persistTheme={false} theme={resolvedTheme}>
      <div className="grid h-svh grid-rows-[auto_1fr]">
        <Header />
        <div className="min-h-0 min-w-0 overflow-x-hidden">
          <Outlet />
        </div>
      </div>
    </ClickUIProvider>
  );
}
