import { env } from "@clickhouse-sql-editor/env/web";
import { SqlMonacoEditor } from "@sqlrooms/sql-editor";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ScrollArea,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@sqlrooms/ui";
import { useCallback, useMemo, useState } from "react";

type QueryStatus = "idle" | "loading" | "success" | "error";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

export function Editor() {
  const [sql, setSql] = useState("SELECT * from system.tables;");
  const [rows, setRows] = useState<Record<string, unknown>[] | null>(null);
  const [status, setStatus] = useState<QueryStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const runQuery = useCallback(async () => {
    setStatus("loading");
    setErrorMessage(null);

    const trimmed = sql.trim();
    if (!trimmed) {
      setStatus("error");
      setErrorMessage("Enter a SQL query to run.");
      return;
    }

    try {
      const response = await fetch(`${env.VITE_SERVER_URL}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
      });

      const payload: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          isRecord(payload) && typeof payload.error === "string"
            ? payload.error
            : response.statusText;
        setRows(null);
        setStatus("error");
        setErrorMessage(message);
        return;
      }

      if (!(isRecord(payload) && Array.isArray(payload.rows))) {
        setRows(null);
        setStatus("error");
        setErrorMessage("Unexpected response from server.");
        return;
      }

      const nextRows = payload.rows.filter(isRecord);
      setRows(nextRows);
      setStatus("success");
    } catch (error) {
      setRows(null);
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Request failed."
      );
    }
  }, [sql]);

  const columns = useMemo(() => {
    if (!rows?.length) {
      return [];
    }
    return Object.keys(rows[0]).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 p-4">
      <Card className="flex min-h-0 shrink-0 flex-col">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-base">SQL</CardTitle>
          <Button
            disabled={status === "loading"}
            onClick={async () => {
              await runQuery();
            }}
            type="button"
          >
            {status === "loading" ? (
              <span className="inline-flex items-center gap-2">
                <Spinner className="size-4" />
                Running…
              </span>
            ) : (
              "Run"
            )}
          </Button>
        </CardHeader>
        <CardContent className="min-h-0 pt-0">
          <SqlMonacoEditor
            height="280px"
            onChange={(v) => setSql(v ?? "")}
            value={sql}
          />
        </CardContent>
      </Card>

      {status === "error" && errorMessage ? (
        <Alert variant="destructive">
          <AlertTitle>Query failed</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      <Card className="flex min-h-0 flex-1 flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Results</CardTitle>
        </CardHeader>
        <CardContent className="min-h-0 flex-1 pt-0">
          {status === "loading" ? (
            <div className="flex items-center gap-2 py-8 text-muted-foreground text-sm">
              <Spinner className="size-4" />
              Executing query…
            </div>
          ) : null}

          {status === "success" && rows?.length === 0 ? (
            <p className="py-6 text-muted-foreground text-sm">
              Query returned no rows.
            </p>
          ) : null}

          {status === "success" && rows && rows.length > 0 ? (
            <ScrollArea className="h-[min(24rem,calc(100vh-28rem))] rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((col: string) => (
                      <TableHead key={col}>{col}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={JSON.stringify(row)}>
                      {columns.map((col: string) => (
                        <TableCell className="max-w-xs truncate" key={col}>
                          {formatCell(row[col])}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          ) : null}

          {status === "idle" ? (
            <p className="py-6 text-muted-foreground text-sm">
              Run a query to see results here.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
