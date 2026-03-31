import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";

const SERVER_URL = "http://localhost:8080";

export const defaultHandlers = [
  http.post(`${SERVER_URL}/query`, async ({ request }) => {
    const body = (await request.json()) as { query?: string };
    const query = body.query?.trim();

    if (query === "SELECT 1") {
      return HttpResponse.json({ rows: [{ value: 1 }] });
    }

    return HttpResponse.json({ rows: [] });
  }),
];

export const server = setupServer(...defaultHandlers);
