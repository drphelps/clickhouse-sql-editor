# clickhouse-sql-editor

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines React, TanStack Start, Express, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **TanStack Start** - SSR framework with TanStack Router
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **Click UI** - ClickHouse’s React component library (`@clickhouse/click-ui`) for editor chrome and data UI
- **Express** - Fast, unopinionated web framework
- **Bun** - Runtime environment
- **Biome** - Linting and formatting
- **Turborepo** - Optimized monorepo build system

## Getting Started

First, install the dependencies:

```bash
bun install
```

Then, run the development server:

```bash
bun run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser to see the web application.
The API is running at [http://localhost:3000](http://localhost:3000).

## Click UI

The web app uses [Click UI](https://click-ui.vercel.app) (`@clickhouse/click-ui`)—ClickHouse’s design system and React components (Storybook at that URL).

### Setup

1. **Provider** — The root layout wraps the app in `ClickUIProvider` so themed components render correctly. See `apps/web/src/routes/__root.tsx`: theme is driven by `next-themes` and passed as `theme="light" | "dark"`; `persistTheme={false}` keeps theme control in this app’s own provider.

2. **Imports** — Use named exports from the package:

```tsx
import { Button, Panel, Icon } from "@clickhouse/click-ui";
```

3. **Version** — The dependency is declared in `apps/web/package.json`. Bump `@clickhouse/click-ui` there when you want a newer release.

### Layout and Tailwind

Page chrome (header, grid, theme toggle) still uses Tailwind. Global tokens and base styles come from `packages/ui` via `apps/web/src/index.css` (`@import "@clickhouse-sql-editor/ui/globals.css"`). Adjust shared CSS variables there if you need to tune non–Click UI surfaces.

## Git Hooks and Formatting

- Format and lint fix: `bun run check`

## Project Structure

```
clickhouse-sql-editor/
├── apps/
│   ├── web/         # Frontend application (React + TanStack Start)
│   └── server/      # Backend API (Express)
├── packages/
│   ├── ui/          # Shared global styles (Tailwind) and small auxiliary components
```

## Available Scripts

- `bun run dev`: Start all applications in development mode
- `bun run build`: Build all applications
- `bun run dev:web`: Start only the web application
- `bun run dev:server`: Start only the server
- `bun run check-types`: Check TypeScript types across all apps
- `bun run check`: Run Biome formatting and linting
