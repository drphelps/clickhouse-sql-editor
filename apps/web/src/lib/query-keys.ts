export const queryKeys = {
  clickhouse: {
    all: ["clickhouse"] as const,
    sqlRun: (runId: number, sql: string) =>
      [...queryKeys.clickhouse.all, "sql-run", runId, sql] as const,
  },
};
