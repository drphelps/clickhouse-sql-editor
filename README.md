# clickhouse-sql-editor

A small monorepo for a local ClickHouse SQL editor:

- `apps/web`: React + TanStack Start frontend
- `apps/server`: Express API that proxies queries to ClickHouse

## Stack

- TypeScript
- Bun
- React + TanStack Start
- Express
- ClickHouse
- Tailwind CSS
- Turborepo

## Run Locally

Prerequisites:

- `bun`
- Docker Desktop or Docker Engine with Compose

Install dependencies:

```bash
bun install
```

Optional: copy the example env files if you want to override the default local values:

```bash
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example apps/web/.env
```

Start ClickHouse in Docker:

```bash
docker compose up -d clickhouse
```

Start the app:

```bash
bun run dev
```

Local URLs:

- Web app: [http://localhost:3001](http://localhost:3001)
- API: [http://localhost:8080](http://localhost:8080)
- ClickHouse HTTP: [http://localhost:8123](http://localhost:8123)

Stop ClickHouse when finished:

```bash
docker compose down
```

## Project Structure

```text
clickhouse-sql-editor/
├── apps/
│   ├── web/       # frontend
│   └── server/    # API
├── packages/
│   ├── env/       # shared env parsing
│   ├── ui/        # shared UI/styles
│   └── config/    # shared tooling config
└── docker/        # ClickHouse config
```

## Useful Commands

- `bun run dev`: start web and server
- `bun run dev:web`: start only the web app
- `bun run dev:server`: start only the server
- `bun run build`: build all apps
- `bun run check-types`: run TypeScript checks
- `bun run check`: run lint/format checks
- `bun run fix`: auto-fix lint/format issues
