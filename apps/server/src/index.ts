import { extname } from "node:path";
import { env } from "@clickhouse-sql-editor/env/server";
import cors from "cors";
import express, { type Request, type Response } from "express";
import multer from "multer";

import { sendScriptExecutionResponse } from "./run-query-script.js";

const app = express();
const port = 8080;

const ALLOWED_UPLOAD_EXTENSIONS = new Set([".sql", ".txt"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (
    _req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    const ext = extname(file.originalname).toLowerCase();
    if (ALLOWED_UPLOAD_EXTENSIONS.has(ext)) {
      cb(null, true);
      return;
    }
    cb(new Error("Only .sql and .txt files are allowed."));
  },
});

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST", "OPTIONS"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (_req, res) => {
  res.send("Hello world!");
});

app.post("/query", async (req: Request, res: Response) => {
  try {
    if (!req.body?.query) {
      res.status(400).send({
        error: "'query' is required",
      });
      return;
    }

    await sendScriptExecutionResponse(res, req, String(req.body.query));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).send({
      error: message,
    });
  }
});

app.post(
  "/query/upload",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file?.buffer) {
        res.status(400).send({
          error: "'file' is required (multipart field name: file)",
        });
        return;
      }

      const script = req.file.buffer.toString("utf8");
      await sendScriptExecutionResponse(res, req, script);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Internal server error";
      res.status(500).send({
        error: message,
      });
    }
  }
);

app.use(
  (err: unknown, _req: Request, res: Response, next: (e?: unknown) => void) => {
    if (err instanceof multer.MulterError) {
      const message =
        err.code === "LIMIT_FILE_SIZE"
          ? "File is too large (max 2 MB)."
          : err.message;
      res.status(400).send({ error: message });
      return;
    }
    if (err instanceof Error) {
      const isFilterRejection =
        err.message === "Only .sql and .txt files are allowed.";
      if (isFilterRejection) {
        res.status(400).send({ error: err.message });
        return;
      }
    }
    next(err);
  }
);

app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
