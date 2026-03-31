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
import { useTheme } from "next-themes";
import Header from "../components/header";
import { AppQueryClientProvider } from "../components/query-client-provider";
import { ThemeProvider } from "../components/theme-provider";

type RouterAppContext = Record<string, never>;

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
  }),

  component: RootDocument,
});

const routeFallback = <div className="h-full min-h-0 min-w-0" />;

function RootDocument() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider>
          <ClientOnly fallback={routeFallback}>
            <ThemedApp />
          </ClientOnly>
        </ThemeProvider>
        <Toaster richColors />
        <TanStackRouterDevtools position="bottom-left" />
        <Scripts />
      </body>
    </html>
  );
}

function ThemedApp() {
  const { resolvedTheme } = useTheme();
  const clickTheme = resolvedTheme === "dark" ? "dark" : "light";

  return (
    <ClickUIProvider persistTheme={false} theme={clickTheme}>
      <AppQueryClientProvider>
        <div className="grid h-svh grid-rows-[auto_1fr]">
          <Header />
          <div className="min-h-0 min-w-0 overflow-x-hidden">
            <Outlet />
          </div>
        </div>
      </AppQueryClientProvider>
    </ClickUIProvider>
  );
}
