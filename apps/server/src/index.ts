import { randomUUID } from "node:crypto";
import { createClient } from "@clickhouse/client";
import { env } from "@clickhouse-sql-editor/env/server";
import cors from "cors";
import express, { type Request, type Response } from "express";

import { executeSqlScript } from "./execute-sql-script.js";

const app = express();
const port = 8080; // default port to listen

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST", "OPTIONS"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// define a route handler for the default home page
app.get("/", (_req, res) => {
  res.send("Hello world!");
});

app.post("/query", async (req: Request, res: Response) => {
  try {
    const clickhouseHeaders = Object.keys(req.headers).reduce(
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

    if (!req.body.query) {
      res.status(400).send({
        error: "'query' is required",
      });
      return;
    }

    const client = createClient({
      url: "http://localhost:8123",
      http_headers: clickhouseHeaders,
      session_id: randomUUID(),
    });

    try {
      const { statements, lastQueryRows } = await executeSqlScript(
        client,
        req.body.query
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
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).send({
      error: message,
    });
  }
});

// start the Express server
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
