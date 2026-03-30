import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const routeFallback = <div className="h-full" />;

const Editor = lazy(async () => {
  const { Editor } = await import("@/components/editor");

  return {
    default: Editor,
  };
});

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <ClientOnly fallback={routeFallback}>
      <Suspense fallback={routeFallback}>
        <Editor />
      </Suspense>
    </ClientOnly>
  );
}
