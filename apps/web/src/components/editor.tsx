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
import { useMutation } from "@tanstack/react-query";
import { useCallback, useState, useTransition } from "react";
import {
  type ActiveQueryRun,
  EditorResultsPanel,
} from "@/components/editor-results-panel";
import { clickhouseSqlUploadMutation } from "@/lib/mutations/clickhouse-sql-upload";
import { normalizeSqlScriptText } from "@/lib/normalize-sql-script";

export function Editor() {
  const [sql, setSql] = useState("");
  const [activeRun, setActiveRun] = useState<ActiveQueryRun | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [uploadFlyoutOpen, setUploadFlyoutOpen] = useState(false);
  const [isUploadStarting, setIsUploadStarting] = useState(false);
  const [isRunPending, startRunTransition] = useTransition();

  const uploadMutation = useMutation(clickhouseSqlUploadMutation);

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
        source: "editor" as const,
        sql: trimmed,
      }));
    });
  }, [sql]);

  const runQueryFromUploadedFile = useCallback(
    async (file: File) => {
      uploadMutation.reset();
      setIsUploadStarting(true);
      setValidationError(null);
      const rawText = await file.text();
      const normalizedScript = normalizeSqlScriptText(rawText);
      if (!normalizedScript) {
        setValidationError("Uploaded file is empty or whitespace only.");
        setIsUploadStarting(false);
        return;
      }

      uploadMutation.mutate(
        { file, normalizedScript },
        {
          onSuccess: (rows, variables) => {
            setSql(variables.normalizedScript);
            setActiveRun((prev) => ({
              runId: (prev?.runId ?? 0) + 1,
              source: "upload" as const,
              rows,
              sql: variables.normalizedScript,
            }));
            // setUploadFlyoutOpen(false);
          },
          onError: (error) => {
            const message =
              error instanceof Error
                ? error.message
                : "Upload or query failed.";
            setValidationError(message);
          },
          onSettled: () => {
            setIsUploadStarting(false);
          },
        }
      );
    },
    [uploadMutation]
  );

  const isBusy = isRunPending || uploadMutation.isPending;
  let runButtonLabel = "Run";
  if (isRunPending) {
    runButtonLabel = "Running…";
  } else if (uploadMutation.isPending) {
    runButtonLabel = "Uploading…";
  }

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
            <Flyout onOpenChange={setUploadFlyoutOpen} open={uploadFlyoutOpen}>
              <Flyout.Trigger>
                <Button
                  disabled={isBusy}
                  label="Upload file"
                  type="secondary"
                />
              </Flyout.Trigger>
              <Flyout.Content
                align="end"
                showOverlay
                size="default"
                strategy="fixed"
              >
                <Flyout.Header
                  description="Runs the full script on the server (split statements, one session). .sql, .txt."
                  title="Upload file"
                />
                <Flyout.Body>
                  <FileUpload
                    failureMessage="Upload failed."
                    onFileSelect={runQueryFromUploadedFile}
                    showProgress={isUploadStarting || uploadMutation.isPending}
                    showSuccess={uploadMutation.isSuccess}
                    size="md"
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
              disabled={isBusy}
              label={runButtonLabel}
              loading={isBusy}
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
