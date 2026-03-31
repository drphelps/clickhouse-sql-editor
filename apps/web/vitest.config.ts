import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

const DAYJS_ROOT = new URL("./node_modules/dayjs", import.meta.url).pathname;

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: [
      {
        find: /^dayjs$/,
        replacement: `${DAYJS_ROOT}/dayjs.min.js`,
      },
      {
        find: /^dayjs\/(.*)$/,
        replacement: `${DAYJS_ROOT}/$1`,
      },
    ],
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup-tests.ts",
    server: {
      deps: {
        inline: ["@clickhouse/click-ui", "dayjs"],
      },
    },
  },
});
