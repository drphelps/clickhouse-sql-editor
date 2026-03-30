import { Button, DangerAlert, Icon, Panel } from "@clickhouse/click-ui";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import {
  EditorQueryResults,
  ResultsPanelHeader,
} from "@/components/editor-query-results";

export type ActiveQueryRun =
  | {
      runId: number;
      source: "editor";
      sql: string;
    }
  | {
      runId: number;
      source: "upload";
      rows: Record<string, unknown>[];
      sql: string;
    };

function QueryErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const text = error instanceof Error ? error.message : "Request failed.";
  return (
    <div className="flex flex-col gap-3">
      <DangerAlert text={text} title="Query failed" />
      <div>
        <Button label="Retry" onClick={resetErrorBoundary} type="secondary" />
      </div>
    </div>
  );
}

function QueryResultsSuspenseFallback() {
  return (
    <>
      <ResultsPanelHeader subtitle={null} />
      <div className="flex items-center gap-2 py-8 text-muted-foreground text-sm">
        <Icon name="loading-animated" size="sm" />
        Executing query…
      </div>
    </>
  );
}

interface EditorResultsPanelProps {
  activeRun: ActiveQueryRun | null;
}

export function EditorResultsPanel({ activeRun }: EditorResultsPanelProps) {
  const errorBoundaryKey = activeRun?.runId ?? "idle";

  return (
    <Panel
      alignItems="start"
      className="flex min-h-0 min-w-0 max-w-full flex-1 flex-col gap-3 overflow-hidden"
      fillHeight
      fillWidth
      hasBorder
      orientation="vertical"
      padding="md"
      radii="md"
    >
      {activeRun ? (
        <QueryErrorResetBoundary>
          {({ reset }) => (
            <ErrorBoundary
              FallbackComponent={QueryErrorFallback}
              key={errorBoundaryKey}
              onReset={reset}
            >
              <Suspense fallback={<QueryResultsSuspenseFallback />}>
                <EditorQueryResults
                  rowsAlreadyFetched={
                    activeRun.source === "upload" ? activeRun.rows : undefined
                  }
                  runId={activeRun.runId}
                  sql={activeRun.sql}
                />
              </Suspense>
            </ErrorBoundary>
          )}
        </QueryErrorResetBoundary>
      ) : (
        <>
          <ResultsPanelHeader subtitle={null} />
          <p className="py-6 text-muted-foreground text-sm">
            Run a query to see results here.
          </p>
        </>
      )}
    </Panel>
  );
}
