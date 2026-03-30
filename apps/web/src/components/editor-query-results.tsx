import type {
  TableColumnConfigProps,
  TableRowType,
} from "@clickhouse/click-ui";
import { Table, Text, Title } from "@clickhouse/click-ui";
import { useSuspenseQuery } from "@tanstack/react-query";
import { type ReactNode, useMemo } from "react";
import { clickhouseSqlRunQueryOptions } from "@/lib/queries/clickhouse-sql-query";

function formatCell(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

const resultColumnHeaderClass =
  "max-w-xs min-w-[11ch] truncate whitespace-nowrap";
const resultColumnCellClass = "max-w-xs min-w-[11ch] truncate align-top";

interface ResultsPanelHeaderProps {
  subtitle: ReactNode;
}

export function ResultsPanelHeader({ subtitle }: ResultsPanelHeaderProps) {
  return (
    <div className="flex flex-row flex-wrap items-center justify-between gap-2">
      <div className="space-y-1">
        <Title size="sm" type="h2">
          Results
        </Title>
        <Text color="muted" size="sm">
          {subtitle}
        </Text>
      </div>
    </div>
  );
}

interface EditorQueryResultsProps {
  runId: number;
  sql: string;
}

export function EditorQueryResults({ runId, sql }: EditorQueryResultsProps) {
  const { data: rows } = useSuspenseQuery(
    clickhouseSqlRunQueryOptions(runId, sql)
  );

  const columns = useMemo(() => {
    const first = rows[0];
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
    if (!rows.length) {
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

  const rowCount = rows.length;

  const subtitle =
    rowCount > 0
      ? `${rowCount.toLocaleString()} row${rowCount === 1 ? "" : "s"} returned`
      : null;

  return (
    <>
      <ResultsPanelHeader subtitle={subtitle} />

      {rows.length === 0 ? (
        <p className="py-6 text-muted-foreground text-sm">
          Query returned no rows.
        </p>
      ) : (
        <div className="[&_table]:table-auto! min-h-0 w-full min-w-0 flex-1 overflow-x-auto overflow-y-auto overscroll-x-contain rounded-md border border-border/70 bg-background/40 [&_table]:w-max! [&_table]:min-w-full!">
          <Table headers={tableHeaders} rows={tableRows} size="sm" />
        </div>
      )}
    </>
  );
}
