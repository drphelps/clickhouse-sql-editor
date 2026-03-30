import { createFileRoute } from "@tanstack/react-router";
import { Editor } from "@/components/editor";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <div className="h-full min-h-0 min-w-0">
      <Editor />
    </div>
  );
}
