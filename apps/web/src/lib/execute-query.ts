import { env } from "@clickhouse-sql-editor/env/web";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseClickhouseQueryPayload(
  response: Response,
  payload: unknown
): Record<string, unknown>[] {
  if (!response.ok) {
    const message =
      isRecord(payload) && typeof payload.error === "string"
        ? payload.error
        : response.statusText;
    throw new Error(message);
  }

  if (!(isRecord(payload) && Array.isArray(payload.rows))) {
    throw new Error("Unexpected response from server.");
  }

  return payload.rows.filter(isRecord);
}

export async function executeClickhouseQuery(
  sql: string
): Promise<Record<string, unknown>[]> {
  try {
    const response = await fetch(`${env.VITE_SERVER_URL}/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: sql }),
    });

    const payload: unknown = await response.json().catch(() => null);
    return parseClickhouseQueryPayload(response, payload);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Request failed.");
  }
}

export async function executeClickhouseQueryFromUpload(
  file: File
): Promise<Record<string, unknown>[]> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${env.VITE_SERVER_URL}/query/upload`, {
      method: "POST",
      body: formData,
    });

    const payload: unknown = await response.json().catch(() => null);
    return parseClickhouseQueryPayload(response, payload);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Request failed.");
  }
}
