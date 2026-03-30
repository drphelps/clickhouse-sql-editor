import { randomUUID } from "node:crypto";
import { createClient } from "@clickhouse/client";
import type { Request, Response } from "express";

import { executeSqlScript } from "./execute-sql-script.js";

const UTF8_BOM_PREFIX = /^\uFEFF/;

export function extractClickHouseHeaders(req: Request): Record<string, string> {
  return Object.keys(req.headers).reduce(
    (acc, key) => {
      if (!key.startsWith("x-clickhouse-")) {
        return acc;
      }
      const raw = req.headers[key];
      if (raw === undefined) {
        return acc;
      }
      acc[key] = Array.isArray(raw) ? raw.join(", ") : raw;
      return acc;
    },
    {} as Record<string, string>
  );
}

export function normalizeSqlScript(script: string): string {
  return script
    .replace(UTF8_BOM_PREFIX, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();
}

export async function sendScriptExecutionResponse(
  res: Response,
  req: Request,
  rawScript: string
): Promise<void> {
  const trimmed = normalizeSqlScript(rawScript);
  if (!trimmed) {
    res.status(400).send({
      error: "SQL script is empty.",
    });
    return;
  }

  const clickhouseHeaders = extractClickHouseHeaders(req);
  const client = createClient({
    url: "http://localhost:8123",
    http_headers: clickhouseHeaders,
    session_id: randomUUID(),
  });

  try {
    const { statements, lastQueryRows } = await executeSqlScript(
      client,
      trimmed
    );

    const failed = statements.find((s) => s.error !== undefined);
    const allOk = failed === undefined;

    const rows =
      statements.length === 1 && statements[0]?.kind === "query" && allOk
        ? (statements[0].rows ?? [])
        : (lastQueryRows ?? []);

    if (!allOk) {
      res.status(500).send({
        error: failed?.error ?? "Query failed",
        statements,
        rows,
      });
      return;
    }

    res.status(200).send({
      rows,
      statements,
    });
  } finally {
    await client.close().catch(() => undefined);
  }
}
