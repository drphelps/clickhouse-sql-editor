import {
  Button,
  DangerAlert,
  FileUpload,
  Flyout,
  Panel,
  Text,
  Title,
} from "@clickhouse/click-ui";
import { SqlMonacoEditor } from "@sqlrooms/sql-editor";
import { useCallback, useState, useTransition } from "react";
import {
  type ActiveQueryRun,
  EditorResultsPanel,
} from "@/components/editor-results-panel";

export function Editor() {
  const [sql, setSql] = useState("SELECT * from system.tables;");
  const [activeRun, setActiveRun] = useState<ActiveQueryRun | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isRunPending, startRunTransition] = useTransition();

  const runQuery = useCallback(() => {
    const trimmed = sql.trim();
    if (!trimmed) {
      setValidationError("Enter a SQL query to run.");
      return;
    }

    setValidationError(null);
    startRunTransition(() => {
      setActiveRun((prev) => ({
        runId: (prev?.runId ?? 0) + 1,
        sql: trimmed,
      }));
    });
  }, [sql]);

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col gap-3 p-3 md:gap-4 md:p-5">
      <Panel
        alignItems="start"
        className="flex min-h-0 min-w-0 shrink-0 flex-col gap-3"
        fillWidth
        hasBorder
        orientation="vertical"
        padding="md"
        radii="md"
      >
        <div className="flex w-full flex-row flex-wrap items-center justify-between gap-2">
          <div className="space-y-1">
            <Title size="sm" type="h2">
              Query
            </Title>
            <Text color="muted" size="sm">
              Run SQL against your ClickHouse endpoint.
            </Text>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Flyout>
              <Flyout.Trigger>
                <Button label="Upload file" type="secondary" />
              </Flyout.Trigger>
              <Flyout.Content
                align="end"
                showOverlay
                size="default"
                strategy="fixed"
              >
                <Flyout.Header
                  description="Drag and drop a file or browse. Accepted: .sql, .txt."
                  title="Upload file"
                />
                <Flyout.Body>
                  <FileUpload
                    supportedFileTypes={[".sql", ".txt"]}
                    title="Drop your file here or click to browse"
                  />
                </Flyout.Body>
                <Flyout.Footer>
                  <Flyout.Close label="Close" />
                </Flyout.Footer>
              </Flyout.Content>
            </Flyout>
            <Button
              disabled={isRunPending}
              label={isRunPending ? "Running…" : "Run"}
              loading={isRunPending}
              onClick={runQuery}
            />
          </div>
        </div>
        <SqlMonacoEditor
          height="280px"
          onChange={(v) => setSql(v ?? "")}
          value={sql}
        />
      </Panel>

      {validationError === null ? null : (
        <DangerAlert text={validationError} title="Query failed" />
      )}

      <EditorResultsPanel activeRun={activeRun} />
    </div>
  );
}
