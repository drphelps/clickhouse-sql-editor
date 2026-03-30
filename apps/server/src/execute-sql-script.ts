import type { ClickHouseClient } from "@clickhouse/client";
import { ClickHouseError } from "@clickhouse/client";
import { splitSqlStatements } from "@sqlrooms/db";

const MAX_STATEMENTS = 100;

const DESC_WORD_REGEX = /^DESC\s/i;
const DESC_ONLY_REGEX = /^DESC$/i;
const WITH_LEADING_REGEX = /^WITH\s/i;
const INSERT_WORD_REGEX = /\bINSERT\b/i;
const SELECT_WORD_REGEX = /\bSELECT\b/i;
const FIRST_KEYWORD_REGEX = /^[A-Za-z]+/;
const QUERY_KEYWORDS = new Set([
  "SELECT",
  "SHOW",
  "DESCRIBE",
  "EXPLAIN",
  "EXISTS",
]);

export interface ScriptStatementResult {
  durationMs: number;
  error?: string;
  errorCode?: string;
  index: number;
  kind: "query" | "command";
  rows: Record<string, unknown>[] | null;
  sql: string;
}

export interface ExecuteScriptResult {
  lastQueryRows: Record<string, unknown>[] | null;
  statements: ScriptStatementResult[];
}

type StatementKind = ScriptStatementResult["kind"];

interface ExecutionAccumulator {
  halted: boolean;
  lastQueryRows: Record<string, unknown>[] | null;
  statements: ScriptStatementResult[];
}

function detectStatementKind(sql: string): StatementKind {
  const trimmed = sql.trimStart();
  const firstKeyword = trimmed.match(FIRST_KEYWORD_REGEX)?.[0]?.toUpperCase();
  if (firstKeyword === undefined) {
    return "command";
  }
  if (QUERY_KEYWORDS.has(firstKeyword)) {
    return "query";
  }
  if (DESC_WORD_REGEX.test(trimmed) || DESC_ONLY_REGEX.test(trimmed)) {
    return "query";
  }
  if (WITH_LEADING_REGEX.test(trimmed)) {
    const insertIdx = trimmed.search(INSERT_WORD_REGEX);
    const selectIdx = trimmed.search(SELECT_WORD_REGEX);
    if (insertIdx !== -1 && (selectIdx === -1 || insertIdx < selectIdx)) {
      return "command";
    }
    return "query";
  }
  return "command";
}

function formatError(error: unknown): { message: string; code?: string } {
  if (error instanceof ClickHouseError) {
    return { message: error.message, code: error.code };
  }
  if (error instanceof Error) {
    return { message: error.message };
  }
  return { message: "Unknown error" };
}

async function runStatement(
  client: ClickHouseClient,
  sql: string,
  index: number
): Promise<ScriptStatementResult> {
  const kind = detectStatementKind(sql);
  const started = performance.now();

  try {
    if (kind === "query") {
      const resultSet = await client.query({
        query: sql,
        format: "JSONEachRow",
      });
      const rows = (await resultSet.json()) as Record<string, unknown>[];
      return {
        index,
        sql,
        kind,
        rows,
        durationMs: Math.round(performance.now() - started),
      };
    }

    await client.command({
      query: sql,
      clickhouse_settings: { wait_end_of_query: 1 },
    });
    return {
      index,
      sql,
      kind,
      rows: null,
      durationMs: Math.round(performance.now() - started),
    };
  } catch (error) {
    const { message, code } = formatError(error);
    return {
      index,
      sql,
      kind,
      rows: null,
      durationMs: Math.round(performance.now() - started),
      error: message,
      errorCode: code,
    };
  }
}

export async function executeSqlScript(
  client: ClickHouseClient,
  script: string
): Promise<ExecuteScriptResult> {
  const statementSql = splitSqlStatements(script);
  if (statementSql.length === 0) {
    return { statements: [], lastQueryRows: null };
  }
  if (statementSql.length > MAX_STATEMENTS) {
    throw new Error(
      `Too many statements (${statementSql.length}). Maximum is ${MAX_STATEMENTS}.`
    );
  }

  const finalState = await statementSql.reduce<Promise<ExecutionAccumulator>>(
    async (accPromise, sql, index) => {
      const acc = await accPromise;
      if (acc.halted) {
        return acc;
      }

      const result = await runStatement(client, sql, index);
      const nextLastRows =
        result.kind === "query" && result.error === undefined
          ? result.rows
          : acc.lastQueryRows;

      return {
        halted: result.error !== undefined,
        statements: [...acc.statements, result],
        lastQueryRows: nextLastRows,
      };
    },
    Promise.resolve({
      halted: false,
      statements: [],
      lastQueryRows: null,
    })
  );

  return {
    statements: finalState.statements,
    lastQueryRows: finalState.lastQueryRows,
  };
}
