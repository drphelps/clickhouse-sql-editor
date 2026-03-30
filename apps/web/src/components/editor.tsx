import type {
  TableColumnConfigProps,
  TableRowType,
} from "@clickhouse/click-ui";
import {
  Button,
  DangerAlert,
  Icon,
  Panel,
  Table,
  Text,
  Title,
} from "@clickhouse/click-ui";
import { env } from "@clickhouse-sql-editor/env/web";
import { SqlMonacoEditor } from "@sqlrooms/sql-editor";
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

/** Readable column floor and cap; overflow ellipsis via Tailwind + Click UI cell truncator. */
const resultColumnHeaderClass =
  "max-w-xs min-w-[11ch] truncate whitespace-nowrap";
const resultColumnCellClass = "max-w-xs min-w-[11ch] truncate align-top";

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
    const first = rows?.[0];
    if (!first) {
      return [];
    }
    return Object.keys(first).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const tableHeaders = useMemo<TableColumnConfigProps[]>(
    () =>
      columns.map((col) => ({
        label: col,
        className: resultColumnHeaderClass,
      })),
    [columns]
  );

  const tableRows = useMemo<TableRowType[]>(() => {
    if (!rows?.length) {
      return [];
    }
    return rows.map((row, rowIndex) => ({
      id: rowIndex,
      items: columns.map((col) => ({
        label: formatCell(row[col]),
        overflowMode: "truncated" as const,
        className: resultColumnCellClass,
      })),
    }));
  }, [rows, columns]);

  const rowCount = rows?.length ?? 0;

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
        <div className="flex flex-row flex-wrap items-center justify-between gap-2">
          <div className="space-y-1">
            <Title size="sm" type="h2">
              Query
            </Title>
            <Text color="muted" size="sm">
              Run SQL against your ClickHouse endpoint.
            </Text>
          </div>
          <Button
            disabled={status === "loading"}
            label={status === "loading" ? "Running…" : "Run"}
            loading={status === "loading"}
            onClick={runQuery}
          />
        </div>
        <SqlMonacoEditor
          height="280px"
          onChange={(v) => setSql(v ?? "")}
          value={sql}
        />
      </Panel>

      {status === "error" && errorMessage ? (
        <DangerAlert text={errorMessage} title="Query failed" />
      ) : null}

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
        <div className="flex flex-row flex-wrap items-center justify-between gap-2">
          <div className="space-y-1">
            <Title size="sm" type="h2">
              Results
            </Title>
            <Text color="muted" size="sm">
              {rowCount > 0
                ? `${rowCount.toLocaleString()} row${rowCount === 1 ? "" : "s"} returned`
                : "Run a query to inspect data."}
            </Text>
          </div>
        </div>

        {status === "loading" ? (
          <div className="flex items-center gap-2 py-8 text-muted-foreground text-sm">
            <Icon name="loading-animated" size="sm" />
            Executing query…
          </div>
        ) : null}

        {status === "success" && rows?.length === 0 ? (
          <p className="py-6 text-muted-foreground text-sm">
            Query returned no rows.
          </p>
        ) : null}

        {status === "success" && rows && rows.length > 0 ? (
          <div className="[&_table]:table-auto! min-h-0 w-full min-w-0 flex-1 overflow-x-auto overflow-y-auto overscroll-x-contain rounded-md border border-border/70 bg-background/40 [&_table]:w-max! [&_table]:min-w-full!">
            <Table headers={tableHeaders} rows={tableRows} size="sm" />
          </div>
        ) : null}

        {status === "idle" ? (
          <p className="py-6 text-muted-foreground text-sm">
            Run a query to see results here.
          </p>
        ) : null}
      </Panel>
    </div>
  );
}
